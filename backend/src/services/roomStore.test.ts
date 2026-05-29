import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, startGame, toRoomSnapshot } from "./roomStore.js";

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
});
