import { describe, expect, it } from "vitest";
import { selectWord } from "./wordService.js";

describe("wordService", () => {
  it("returns a word from the pool", () => {
    const word = selectWord("ABCD", 1);

    expect(word).toBeDefined();
    expect(typeof word).toBe("string");
    expect(word.length).toBeGreaterThanOrEqual(3);
  });

  it("returns the same word for the same code and round", () => {
    const first = selectWord("ABCD", 1);
    const second = selectWord("ABCD", 1);

    expect(first).toBe(second);
  });

  it("returns different words for different round numbers", () => {
    const round1 = selectWord("ABCD", 1);
    const round2 = selectWord("ABCD", 2);

    expect(round1).not.toBe(round2);
  });

  it("returns different words for different room codes", () => {
    const room1 = selectWord("ABCD", 1);
    const room2 = selectWord("EFGH", 1);

    expect(room1).not.toBe(room2);
  });

  it("is case-insensitive for code matching", () => {
    const upper = selectWord("ABCD", 1);
    const lower = selectWord("abcd", 1);

    expect(upper).toBe(lower);
  });
});
