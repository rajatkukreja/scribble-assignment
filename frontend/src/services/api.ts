export type ParticipantRole = "drawer" | "guesser";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  points: CanvasPoint[];
  color: string;
  width: number;
}

export interface Guess {
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface RoundScore {
  participantId: string;
  points: number;
}

export interface Participant {
  id: string;
  name: string;
  score: number;
  joinedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: "lobby" | "drawing" | "result";
  hostId: string;
  participants: Participant[];
  currentRound: number;
  drawerId: string | null;
  secretWord: string | null;
  availableWords: string[];
  roles: ParticipantRole[];
  currentRoundGuesses: Guess[];
  canvasStrokes: CanvasStroke[];
  roundScores: RoundScore[] | null;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}

export interface RoomStartResponse {
  room: RoomSnapshot;
}

export interface GuessResponse {
  correct: boolean;
  room: RoomSnapshot;
}

export interface CanvasActionResponse {
  ok: boolean;
  room: RoomSnapshot;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ error: "Request failed" }))) as {
      error?: string;
    };

    throw new Error(errorBody.error ?? "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  createRoom(playerName: string) {
    return request<RoomSessionResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  joinRoom(code: string, playerName: string) {
    return request<RoomSessionResponse>(`/rooms/${encodeURIComponent(code)}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  fetchRoom(code: string, participantId?: string) {
    const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : "";
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}${query}`);
  },
  startGame(code: string, participantId: string) {
    return request<RoomStartResponse>(`/rooms/${encodeURIComponent(code)}/start`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  submitGuess(code: string, participantId: string, guess: string) {
    return request<GuessResponse>(`/rooms/${encodeURIComponent(code)}/guess`, {
      method: "POST",
      body: JSON.stringify({ participantId, guess })
    });
  },
  saveStroke(code: string, participantId: string, stroke: CanvasStroke) {
    return request<CanvasActionResponse>(`/rooms/${encodeURIComponent(code)}/canvas/stroke`, {
      method: "POST",
      body: JSON.stringify({ participantId, stroke })
    });
  },
  clearCanvas(code: string, participantId: string) {
    return request<CanvasActionResponse>(`/rooms/${encodeURIComponent(code)}/canvas/clear`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },

  endRound(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/end-round`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  }
};
