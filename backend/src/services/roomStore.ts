import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";
import { endRound as endGameRound, startRound } from "./gameService.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    score: 0,
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    currentRound: 0,
    drawerId: null,
    secretWord: null,
    drawCounts: {},
    currentRoundGuesses: [],
    canvasStrokes: [],
    correctGuessOrder: 0,
    roundScores: [],
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export type JoinRoomResult =
  | { ok: true; room: Room; participantId: string }
  | { ok: false; status: number; error: string };

export function joinRoom(code: string, playerName: string): JoinRoomResult {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const trimmedName = playerName.trim();

  if (!trimmedName) {
    return { ok: false, status: 400, error: "Player name is required" };
  }

  const room = rooms.get(trimmedCode.toUpperCase());

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  const participant = createParticipant(trimmedName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    ok: true,
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export type StartGameResult =
  | { ok: true; room: Room }
  | { ok: false; status: number; error: string };

export type SubmitGuessResult =
  | { ok: true; correct: boolean; room: Room }
  | { ok: false; status: number; error: string };

export type EndRoundResult =
  | { ok: true; room: Room }
  | { ok: false; status: number; error: string };

export function startGame(code: string, participantId: string): StartGameResult {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const room = rooms.get(trimmedCode);

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  if (room.hostId !== participantId) {
    return { ok: false, status: 403, error: "Only the host can start the game" };
  }

  if (room.participants.length < 2) {
    return { ok: false, status: 400, error: "At least 2 players are required to start" };
  }

  startRound(room);

  return { ok: true, room: cloneRoom(room) };
}

export function submitGuess(code: string, participantId: string, guess: string): SubmitGuessResult {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const room = rooms.get(trimmedCode);

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  if (room.status !== "drawing") {
    return { ok: false, status: 400, error: "No round in progress" };
  }

  if (room.drawerId === participantId) {
    return { ok: false, status: 403, error: "The drawer cannot guess" };
  }

  const trimmedGuess = guess.trim();

  if (!trimmedGuess) {
    return { ok: false, status: 400, error: "Guess cannot be empty" };
  }

  if (trimmedGuess.length > 100) {
    return { ok: false, status: 400, error: "Guess cannot exceed 100 characters" };
  }

  const duplicate = room.currentRoundGuesses.some(
    (g) => g.participantId === participantId && g.text.toLowerCase() === trimmedGuess.toLowerCase()
  );

  if (duplicate) {
    return { ok: false, status: 400, error: "You already submitted that guess" };
  }

  const correct = trimmedGuess.toLowerCase() === (room.secretWord ?? "").toLowerCase();
  const guesser = room.participants.find((p) => p.id === participantId);

  room.currentRoundGuesses.push({
    participantId,
    participantName: guesser?.name ?? "Unknown",
    text: trimmedGuess,
    isCorrect: correct,
    timestamp: now()
  });

  if (correct) {
    room.correctGuessOrder += 1;

    const guesserIds = room.participants.filter(p => p.id !== room.drawerId).map(p => p.id);
    const correctGuesserIds = new Set(
      room.currentRoundGuesses.filter(g => g.isCorrect).map(g => g.participantId)
    );
    const allCorrect = guesserIds.every(id => correctGuesserIds.has(id));

    if (allCorrect) {
      endGameRound(room);
    }
  }

  room.updatedAt = now();

  return { ok: true, correct, room: cloneRoom(room) };
}

export type CanvasActionResult =
  | { ok: true; room: Room }
  | { ok: false; status: number; error: string };

export function saveCanvasStroke(code: string, participantId: string, stroke: { points: { x: number; y: number }[]; color: string; width: number }): CanvasActionResult {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const room = rooms.get(trimmedCode);

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  if (room.status !== "drawing") {
    return { ok: false, status: 400, error: "No round in progress" };
  }

  if (room.drawerId !== participantId) {
    return { ok: false, status: 403, error: "Only the drawer can draw" };
  }

  room.canvasStrokes.push(stroke);
  room.updatedAt = now();

  return { ok: true, room: cloneRoom(room) };
}

export function clearCanvas(code: string, participantId: string): CanvasActionResult {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const room = rooms.get(trimmedCode);

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  if (room.status !== "drawing") {
    return { ok: false, status: 400, error: "No round in progress" };
  }

  if (room.drawerId !== participantId) {
    return { ok: false, status: 403, error: "Only the drawer can clear the canvas" };
  }

  room.canvasStrokes = [];
  room.updatedAt = now();

  return { ok: true, room: cloneRoom(room) };
}

export function endRound(code: string, participantId: string): EndRoundResult {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return { ok: false, status: 400, error: "Room code is required" };
  }

  const room = rooms.get(trimmedCode);

  if (!room) {
    return { ok: false, status: 404, error: "Room not found" };
  }

  if (room.status !== "drawing") {
    return { ok: false, status: 400, error: "No round in progress" };
  }

  if (room.hostId !== participantId) {
    return { ok: false, status: 403, error: "Only the host can end the round" };
  }

  endGameRound(room);
  room.updatedAt = now();

  return { ok: true, room: cloneRoom(room) };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const isDrawer = viewerParticipantId !== undefined && viewerParticipantId === room.drawerId;

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    currentRound: room.currentRound,
    drawerId: room.drawerId,
    secretWord: isDrawer ? room.secretWord : null,
    availableWords: listWords(),
    roles: [...STARTER_ROLES],
    currentRoundGuesses: [...room.currentRoundGuesses],
    canvasStrokes: room.canvasStrokes.map((s) => ({ ...s, points: [...s.points] })),
    roundScores: room.roundScores.length > 0 ? room.roundScores.map((s) => ({ ...s })) : null
  };
}
