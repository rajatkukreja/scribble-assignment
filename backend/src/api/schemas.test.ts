import { describe, expect, it } from "vitest";
import { createRoomSchema, guessSchema, joinRoomSchema, playerNameSchema, roomCodeParamsSchema, startGameSchema } from "./schemas.js";

describe("schemas", () => {
  describe("playerNameSchema", () => {
    it("accepts a valid name", () => {
      const result = playerNameSchema.parse("Alice");

      expect(result).toBe("Alice");
    });

    it("trims leading and trailing whitespace", () => {
      const result = playerNameSchema.parse("  Alice  ");

      expect(result).toBe("Alice");
    });

    it("rejects empty name", () => {
      expect(() => playerNameSchema.parse("")).toThrow("Player name is required");
    });

    it("rejects whitespace-only name", () => {
      expect(() => playerNameSchema.parse("   ")).toThrow("Player name is required");
    });
  });

  describe("createRoomSchema", () => {
    it("accepts a valid body with playerName", () => {
      const result = createRoomSchema.parse({ playerName: "Alice" });

      expect(result.playerName).toBe("Alice");
    });

    it("trims playerName", () => {
      const result = createRoomSchema.parse({ playerName: "  Alice  " });

      expect(result.playerName).toBe("Alice");
    });

    it("rejects empty playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "" })).toThrow("Player name is required");
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow("Player name is required");
    });
  });

  describe("joinRoomSchema", () => {
    it("trims playerName", () => {
      const result = joinRoomSchema.parse({ playerName: "  Bob  " });

      expect(result.playerName).toBe("Bob");
    });
  });

  describe("startGameSchema", () => {
    it("accepts a valid participantId", () => {
      const result = startGameSchema.parse({ participantId: "abc-123" });

      expect(result.participantId).toBe("abc-123");
    });
  });

  describe("guessSchema", () => {
    it("trims guess", () => {
      const result = guessSchema.parse({ participantId: "abc-123", guess: "  pizza  " });

      expect(result.guess).toBe("pizza");
    });

    it("rejects empty guess", () => {
      expect(() => guessSchema.parse({ participantId: "abc-123", guess: "" })).toThrow("Guess cannot be empty");
    });
  });

  it("roomCodeParamsSchema rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow();
  });
});
