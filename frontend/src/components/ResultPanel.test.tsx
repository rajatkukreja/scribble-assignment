import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultPanel } from "./ResultPanel";

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
    drawerId: "p1",
    secretWord: "rocket",
    participants: [
      { id: "p1", name: "Alice", score: 15, joinedAt: "" },
      { id: "p2", name: "Bob", score: 10, joinedAt: "" },
      { id: "p3", name: "Charlie", score: 0, joinedAt: "" }
    ],
    currentRound: 1,
    hostId: "p1",
    availableWords: [],
    roles: ["drawer" as const, "guesser" as const],
    currentRoundGuesses: [
      { participantId: "p2", participantName: "Bob", text: "rocket", isCorrect: true, timestamp: "2026-01-01T00:00:02Z" },
      { participantId: "p3", participantName: "Charlie", text: "car", isCorrect: false, timestamp: "2026-01-01T00:00:01Z" }
    ],
    canvasStrokes: [],
    roundScores: null,
    ...overrides
  };
}

describe("ResultPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
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

    const { container, cleanup } = render(createElement(ResultPanel));
    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("renders nothing when status is not result", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({ status: "drawing" }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));
    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("renders nothing when roundScores is null", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({ status: "result", roundScores: null }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));
    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("displays the secret word prominently in result state", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        status: "result",
        roundScores: [
          { participantId: "p1", points: 5 },
          { participantId: "p2", points: 10 },
          { participantId: "p3", points: 0 }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));

    expect(container.textContent).toContain("rocket");
    expect(container.querySelector(".result-word")).not.toBeNull();

    cleanup();
  });

  it("shows round scores sorted by points descending", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        status: "result",
        roundScores: [
          { participantId: "p1", points: 5 },
          { participantId: "p2", points: 10 },
          { participantId: "p3", points: 0 }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));

    const rows = container.querySelectorAll(".score-row");
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain("Bob");
    expect(rows[0].textContent).toContain("+10");
    expect(rows[1].textContent).toContain("Alice");
    expect(rows[1].textContent).toContain("+5");
    expect(rows[2].textContent).toContain("Charlie");
    expect(rows[2].textContent).toContain("+0");

    cleanup();
  });

  it("shows cumulative total score for each participant", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        status: "result",
        roundScores: [
          { participantId: "p2", points: 10 },
          { participantId: "p1", points: 5 },
          { participantId: "p3", points: 0 }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));

    const rows = container.querySelectorAll(".score-row");
    expect(rows[0].textContent).toContain("Bob");

    const bobTotal = rows[0].querySelector(".score-row__total");
    expect(bobTotal?.textContent).toBe("10");

    const aliceTotal = rows[1].querySelector(".score-row__total");
    expect(aliceTotal?.textContent).toBe("15");

    cleanup();
  });

  it("visually distinguishes correct guessers", () => {
    mockUseRoomState.mockReturnValue({
      room: makeRoom({
        status: "result",
        roundScores: [
          { participantId: "p1", points: 5 },
          { participantId: "p2", points: 10 },
          { participantId: "p3", points: 0 }
        ]
      }),
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(ResultPanel));

    const correctBadge = container.querySelector(".score-row__correct-badge");
    expect(correctBadge).not.toBeNull();
    expect(correctBadge?.textContent).toContain("Correct");

    cleanup();
  });
});
