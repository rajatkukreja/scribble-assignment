import { describe, expect, it } from "vitest";
import { clearCanvas, createRoom, endRound, joinRoom, saveCanvasStroke, startGame, submitGuess, toRoomSnapshot } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("createRoom assigns hostId matching the creator's participantId", () => {
    const result = createRoom("Alice");

    expect(result.room.hostId).toBe(result.participantId);
  });

  it("joinRoom returns error for an empty room code", () => {
    const result = joinRoom("", "Bob");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
  });

  it("joinRoom returns error for a non-existent room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });

  it("joinRoom succeeds for a valid room code", () => {
    const created = createRoom("Alice");
    const result = joinRoom(created.room.code, "Bob");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.participants).toHaveLength(2);
    }
  });

  it("joinRoom returns error for empty player name", () => {
    const created = createRoom("Alice");
    const result = joinRoom(created.room.code, "");

    expect(result.ok).toBe(false);
  });

  it("joinRoom trims leading and trailing whitespace from player name", () => {
    const created = createRoom("Alice");
    const result = joinRoom(created.room.code, "  Bob  ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.room.participants[1].name).toBe("Bob");
    }
  });

  it("joinRoom rejects whitespace-only player name", () => {
    const created = createRoom("Alice");
    const result = joinRoom(created.room.code, "   ");

    expect(result.ok).toBe(false);
  });

  describe("startGame", () => {
    it("allows host to start with 2+ players", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const result = startGame(created.room.code, created.participantId);

      expect(result.ok).toBe(true);
    });

    it("rejects non-host player trying to start", () => {
      const created = createRoom("Alice");
      const joiner = joinRoom(created.room.code, "Bob");
      if (!joiner.ok) throw new Error("join failed");
      const result = startGame(created.room.code, joiner.participantId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("rejects start with only 1 player", () => {
      const created = createRoom("Alice");
      const result = startGame(created.room.code, created.participantId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("returns 404 for non-existent room", () => {
      const result = startGame("ZZZZ", "some-id");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(404);
      }
    });

    it("transitions room to drawing state with drawer assigned", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const result = startGame(created.room.code, created.participantId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.room.status).toBe("drawing");
        expect(result.room.currentRound).toBe(1);
        expect(result.room.drawerId).toBeDefined();
        expect(typeof result.room.drawerId).toBe("string");
        expect(result.room.secretWord).toBeDefined();
        expect(typeof result.room.secretWord).toBe("string");
      }
    });

    it("toRoomSnapshot includes secretWord for the drawer", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const snapshotForHost = toRoomSnapshot(started.room, created.participantId);
      expect(snapshotForHost.drawerId).toBeDefined();

      if (snapshotForHost.drawerId === created.participantId) {
        expect(snapshotForHost.secretWord).toBe(started.room.secretWord);
      } else {
        const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;
        const snapshotForDrawer = toRoomSnapshot(started.room, created.participantId);
        const snapshotForNonDrawer = toRoomSnapshot(started.room, joinerId);

        expect(snapshotForDrawer.secretWord).toBe(started.room.secretWord);
        expect(snapshotForNonDrawer.secretWord).toBeNull();
      }
    });

    it("does not assign the same drawer two rounds in a row", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      joinRoom(created.room.code, "Charlie");

      const first = startGame(created.room.code, created.participantId);
      expect(first.ok).toBe(true);
      if (!first.ok) return;
      const firstDrawer = first.room.drawerId;

      const second = startGame(created.room.code, created.participantId);
      expect(second.ok).toBe(true);
      if (!second.ok) return;

      expect(second.room.drawerId).not.toBe(firstDrawer);
    });
  });

  describe("saveCanvasStroke", () => {
    it("allows drawer to save a stroke", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const drawerId = started.room.drawerId!;

      const result = saveCanvasStroke(created.room.code, drawerId, {
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        color: "#FF0000",
        width: 3
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.room.canvasStrokes).toHaveLength(1);
        expect(result.room.canvasStrokes[0].color).toBe("#FF0000");
      }
    });

    it("rejects stroke from non-drawer", () => {
      const created = createRoom("Alice");
      const joiner = joinRoom(created.room.code, "Bob");
      expect(joiner.ok).toBe(true);
      if (!joiner.ok) return;
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const result = saveCanvasStroke(created.room.code, joiner.participantId, {
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        color: "#FF0000",
        width: 3
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("rejects stroke when no round in progress", () => {
      const created = createRoom("Alice");

      const result = saveCanvasStroke(created.room.code, created.participantId, {
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        color: "#FF0000",
        width: 3
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });
  });

  describe("clearCanvas", () => {
    it("clears all strokes for the drawer", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const drawerId = started.room.drawerId!;

      saveCanvasStroke(created.room.code, drawerId, {
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        color: "#FF0000",
        width: 3
      });

      const result = clearCanvas(created.room.code, drawerId);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.room.canvasStrokes).toHaveLength(0);
      }
    });

    it("rejects clear from non-drawer", () => {
      const created = createRoom("Alice");
      const joiner = joinRoom(created.room.code, "Bob");
      expect(joiner.ok).toBe(true);
      if (!joiner.ok) return;
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const result = clearCanvas(created.room.code, joiner.participantId);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });
  });

  describe("submitGuess", () => {
    it("transitions to result when all guessers have guessed correctly", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;
      const secretWord = started.room.secretWord!;

      const result = submitGuess(created.room.code, joinerId, secretWord);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.correct).toBe(true);
        expect(result.room.status).toBe("result");
        expect(result.room.currentRoundGuesses).toHaveLength(1);
        expect(result.room.currentRoundGuesses[0].isCorrect).toBe(true);
      }
    });

    it("stays in drawing state on correct guess when other guessers remain", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      joinRoom(created.room.code, "Charlie");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const bobId = started.room.participants.find(p => p.name === "Bob")!.id;
      const secretWord = started.room.secretWord!;

      const result = submitGuess(created.room.code, bobId, secretWord);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.correct).toBe(true);
        expect(result.room.status).toBe("drawing");
        expect(result.room.currentRoundGuesses).toHaveLength(1);
      }
    });

    it("stores guess in history on incorrect guess", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;

      const result = submitGuess(created.room.code, joinerId, "wrongguess");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.correct).toBe(false);
        expect(result.room.status).toBe("drawing");
        expect(result.room.currentRoundGuesses[0].isCorrect).toBe(false);
      }
    });

    it("rejects duplicate guess from same player", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;

      submitGuess(created.room.code, joinerId, "apple");
      const result = submitGuess(created.room.code, joinerId, "apple");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
        expect(result.error).toContain("already submitted");
      }
    });

    it("rejects empty guess", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;

      const result = submitGuess(created.room.code, joinerId, "   ");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("rejects drawer submitting a guess", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const result = submitGuess(created.room.code, created.participantId, "test");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("rejects guess exceeding 100 characters", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const joinerId = started.room.participants.find((p) => p.id !== created.participantId)!.id;

      const longGuess = "a".repeat(101);
      const result = submitGuess(created.room.code, joinerId, longGuess);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });
  });

  describe("endRound", () => {
    it("transitions room to result state when called by host", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const result = endRound(created.room.code, created.participantId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.room.status).toBe("result");
      }
    });

    it("rejects end-round from non-host player", () => {
      const created = createRoom("Alice");
      const joiner = joinRoom(created.room.code, "Bob");
      if (!joiner.ok) throw new Error("join failed");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;

      const result = endRound(created.room.code, joiner.participantId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("rejects end-round when no round in progress", () => {
      const created = createRoom("Alice");

      const result = endRound(created.room.code, created.participantId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("calculates and stores scores on end-round", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      joinRoom(created.room.code, "Charlie");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const secretWord = started.room.secretWord!;
      const bobId = started.room.participants.find(p => p.name === "Bob")!.id;
      const charlieId = started.room.participants.find(p => p.name === "Charlie")!.id;

      submitGuess(created.room.code, bobId, secretWord);
      submitGuess(created.room.code, charlieId, "wrong");

      const result = endRound(created.room.code, created.participantId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.room.roundScores).not.toBeNull();
      expect(result.room.roundScores!.length).toBe(3);

      const bobScore = result.room.roundScores!.find(s => s.participantId === bobId)!;
      expect(bobScore.points).toBe(10);

      const aliceScore = result.room.roundScores!.find(s => s.participantId === created.participantId)!;
      expect(aliceScore.points).toBe(5);

      const charlieScore = result.room.roundScores!.find(s => s.participantId === charlieId)!;
      expect(charlieScore.points).toBe(0);
    });

    it("accumulates scores into participant totals", () => {
      const created = createRoom("Alice");
      joinRoom(created.room.code, "Bob");
      joinRoom(created.room.code, "Charlie");
      const started = startGame(created.room.code, created.participantId);
      expect(started.ok).toBe(true);
      if (!started.ok) return;
      const secretWord = started.room.secretWord!;
      const bobId = started.room.participants.find(p => p.name === "Bob")!.id;

      submitGuess(created.room.code, bobId, secretWord);

      const result = endRound(created.room.code, created.participantId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const bob = result.room.participants.find(p => p.id === bobId)!;
      expect(bob.score).toBe(10);
    });
  });
});
