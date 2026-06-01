import { describe, expect, it } from "vitest";
import { clearCanvasSchema, createRoomSchema, guessSchema, joinRoomSchema, playerNameSchema, roomCodeParamsSchema, saveCanvasStrokeSchema, startGameSchema } from "./schemas.js";

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

    it("rejects guess exceeding 100 characters", () => {
      expect(() => guessSchema.parse({ participantId: "abc-123", guess: "a".repeat(101) })).toThrow("Guess cannot exceed 100 characters");
    });
  });

  it("roomCodeParamsSchema rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow();
  });

  describe("saveCanvasStrokeSchema", () => {
    it("accepts a valid stroke", () => {
      const result = saveCanvasStrokeSchema.parse({
        participantId: "abc-123",
        stroke: { points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: "#FF0000", width: 3 }
      });

      expect(result.participantId).toBe("abc-123");
      expect(result.stroke.points).toHaveLength(2);
    });

    it("rejects stroke with single point", () => {
      expect(() =>
        saveCanvasStrokeSchema.parse({
          participantId: "abc-123",
          stroke: { points: [{ x: 0, y: 0 }], color: "#FF0000", width: 3 }
        })
      ).toThrow("Stroke must have at least 2 points");
    });

    it("rejects stroke with invalid hex color", () => {
      expect(() =>
        saveCanvasStrokeSchema.parse({
          participantId: "abc-123",
          stroke: { points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: "red", width: 3 }
        })
      ).toThrow("Color must be a valid hex color");
    });

    it("rejects stroke with non-positive width", () => {
      expect(() =>
        saveCanvasStrokeSchema.parse({
          participantId: "abc-123",
          stroke: { points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: "#FF0000", width: -1 }
        })
      ).toThrow("Width must be positive");
    });
  });

  describe("clearCanvasSchema", () => {
    it("accepts a valid participantId", () => {
      const result = clearCanvasSchema.parse({ participantId: "abc-123" });

      expect(result.participantId).toBe("abc-123");
    });
  });
});
