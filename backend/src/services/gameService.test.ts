import { describe, expect, it } from "vitest";
import { calculateRoundScores } from "./gameService.js";
import type { Guess, Participant } from "../models/game.js";

function makeGuess(overrides: Partial<Guess> & { participantId: string; isCorrect: boolean }): Guess {
  return {
    participantName: "Test",
    text: "test",
    timestamp: "2026-01-01T00:00:00Z",
    ...overrides
  };
}

describe("calculateRoundScores", () => {
  const participants: Participant[] = [
    { id: "p1", name: "Alice", score: 0, joinedAt: "" },
    { id: "p2", name: "Bob", score: 0, joinedAt: "" },
    { id: "p3", name: "Charlie", score: 0, joinedAt: "" }
  ];

  it("awards 10/8 to first 2 correct guessers and 5*2=10 to drawer", () => {
    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: true, text: "rocket" }),
      makeGuess({ participantId: "p3", isCorrect: true, text: "rocket" })
    ];

    const scores = calculateRoundScores(participants, guesses, "p1");

    expect(scores.find(s => s.participantId === "p1")!.points).toBe(10);
    expect(scores.find(s => s.participantId === "p2")!.points).toBe(10);
    expect(scores.find(s => s.participantId === "p3")!.points).toBe(8);
  });

  it("awards drawer 5 points per correct guesser", () => {
    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: true }),
      makeGuess({ participantId: "p3", isCorrect: true })
    ];

    const scores = calculateRoundScores(participants, guesses, "p1");

    expect(scores.find(s => s.participantId === "p1")!.points).toBe(10);
  });

  it("awards drawer 0 points when no one guesses correctly", () => {
    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: false })
    ];

    const scores = calculateRoundScores(participants, guesses, "p1");

    expect(scores.find(s => s.participantId === "p1")!.points).toBe(0);
    expect(scores.find(s => s.participantId === "p2")!.points).toBe(0);
  });

  it("floors at 3 points for later correct guessers (5th+)", () => {
    const participants5: Participant[] = [
      { id: "p1", name: "Drawer", score: 0, joinedAt: "" },
      { id: "p2", name: "G1", score: 0, joinedAt: "" },
      { id: "p3", name: "G2", score: 0, joinedAt: "" },
      { id: "p4", name: "G3", score: 0, joinedAt: "" },
      { id: "p5", name: "G4", score: 0, joinedAt: "" },
      { id: "p6", name: "G5", score: 0, joinedAt: "" }
    ];

    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: true }),
      makeGuess({ participantId: "p3", isCorrect: true }),
      makeGuess({ participantId: "p4", isCorrect: true }),
      makeGuess({ participantId: "p5", isCorrect: true }),
      makeGuess({ participantId: "p6", isCorrect: true })
    ];

    const scores = calculateRoundScores(participants5, guesses, "p1");

    expect(scores.find(s => s.participantId === "p2")!.points).toBe(10);
    expect(scores.find(s => s.participantId === "p3")!.points).toBe(8);
    expect(scores.find(s => s.participantId === "p4")!.points).toBe(6);
    expect(scores.find(s => s.participantId === "p5")!.points).toBe(4);
    expect(scores.find(s => s.participantId === "p6")!.points).toBe(3);
  });

  it("is deterministic — same inputs produce same outputs", () => {
    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: true }),
      makeGuess({ participantId: "p3", isCorrect: false })
    ];

    const first = calculateRoundScores(participants, guesses, "p1");
    const second = calculateRoundScores(participants, guesses, "p1");

    expect(first).toEqual(second);
  });

  it("only counts first correct guess per participant (not duplicates)", () => {
    const guesses: Guess[] = [
      makeGuess({ participantId: "p2", isCorrect: true }),
      makeGuess({ participantId: "p2", isCorrect: true })
    ];

    const scores = calculateRoundScores(participants, guesses, "p1");

    const drawer = scores.find(s => s.participantId === "p1")!;
    expect(drawer.points).toBe(5);
  });
});
