export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "drawing" | "result";

export interface Participant {
  id: string;
  name: string;
  score: number;
  joinedAt: string;
}

export interface Round {
  number: number;
  drawerId: string;
  secretWord: string;
  status: "drawing" | "result";
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  currentRound: number;
  drawerId: string | null;
  secretWord: string | null;
  drawCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  currentRound: number;
  drawerId: string | null;
  secretWord: string | null;
  availableWords: string[];
  roles: ParticipantRole[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
