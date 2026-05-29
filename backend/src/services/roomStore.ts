import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

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
  void viewerParticipantId;

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
