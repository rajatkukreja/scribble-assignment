import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuessHistory } from "./GuessHistory";

vi.mock("../state/roomStore", () => ({
  useRoomState: vi.fn()
}));

import { useRoomState } from "../state/roomStore";

const mockUseRoomState = vi.mocked(useRoomState);

function render(ui: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  return { container, root, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

function makeRoom(overrides?: Record<string, unknown>) {
  return {
    code: "ABCD",
    status: "drawing" as const,
    drawerId: "p2",
    secretWord: "rocket",
    participants: [
      { id: "p1", name: "Alice", score: 0, joinedAt: "" },
      { id: "p2", name: "Bob", score: 0, joinedAt: "" }
    ],
    currentRound: 1,
    hostId: "p1",
    availableWords: [],
    roles: ["drawer" as const, "guesser" as const],
    currentRoundGuesses: [],
    canvasStrokes: [],
    roundScores: null,
    ...overrides
  };
}

describe("GuessHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("renders nothing when there are no guesses", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom(),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(GuessHistory));
    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("renders nothing when room is null", () => {
    mockUseRoomState.mockReturnValue({
      room: null,
      participantId: null,
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(GuessHistory));
    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("shows list of guesses sorted by timestamp", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        currentRoundGuesses: [
          { participantId: "p1", participantName: "Alice", text: "car", isCorrect: false, timestamp: "2026-01-01T00:00:02Z" },
          { participantId: "p1", participantName: "Alice", text: "bike", isCorrect: false, timestamp: "2026-01-01T00:00:01Z" }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(GuessHistory));
    const entries = container.querySelectorAll(".guess-entry");
    expect(entries.length).toBe(2);
    expect(entries[0].textContent).toContain("bike");
    expect(entries[1].textContent).toContain("car");
    cleanup();
  });

  it("shows correct badge for correct guesses", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        currentRoundGuesses: [
          { participantId: "p1", participantName: "Alice", text: "rocket", isCorrect: true, timestamp: "2026-01-01T00:00:01Z" }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(GuessHistory));
    expect(container.querySelector(".guess-entry--correct")).not.toBeNull();
    expect(container.querySelector(".guess-entry__badge")?.textContent).toBe("Correct!");
    expect(container.textContent).toContain("Alice");
    cleanup();
  });
});
