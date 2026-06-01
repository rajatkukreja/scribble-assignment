import { z } from "zod";

export const playerNameSchema = z.string().trim().min(1, "Player name is required");

export const createRoomSchema = z.object({
  playerName: playerNameSchema
});

export const joinRoomSchema = z.object({
  playerName: playerNameSchema
});

export const startGameSchema = z.object({
  participantId: z.string()
});

export const guessSchema = z.object({
  participantId: z.string(),
  guess: z.string().trim().min(1, "Guess cannot be empty").max(100, "Guess cannot exceed 100 characters")
});

export const roomCodeParamsSchema = z.object({
  code: z.string().trim().min(1, "Room code is required")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const strokePointSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const strokeSchema = z.object({
  points: z.array(strokePointSchema).min(2, "Stroke must have at least 2 points"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color"),
  width: z.number().positive("Width must be positive")
});

export const saveCanvasStrokeSchema = z.object({
  participantId: z.string(),
  stroke: strokeSchema
});

export const clearCanvasSchema = z.object({
  participantId: z.string()
});

export const endRoundSchema = z.object({
  participantId: z.string()
});

export const restartGameSchema = z.object({
  participantId: z.string()
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
