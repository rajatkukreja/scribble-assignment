import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WordDisplay } from "./WordDisplay";

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

describe("WordDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("shows the secret word when user is the drawer", () => {
    mockUseRoomState.mockReturnValue({
      room: {
        code: "ABCD",
        status: "drawing" as const,
        drawerId: "p1",
        secretWord: "rocket",
        participants: [{ id: "p1", name: "Alice", score: 0, joinedAt: "" }],
        currentRound: 1,
        hostId: "p1",
        availableWords: [],
        roles: ["drawer" as const, "guesser" as const]
      },
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(WordDisplay));

    expect(container.textContent).toContain("rocket");
    cleanup();
  });

  it("shows waiting state when user is not the drawer", () => {
    mockUseRoomState.mockReturnValue({
      room: {
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
        roles: ["drawer" as const, "guesser" as const]
      },
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(WordDisplay));

    expect(container.textContent).toContain("Waiting for the drawer to draw");
    cleanup();
  });

  it("renders nothing when room is not in drawing state", () => {
    mockUseRoomState.mockReturnValue({
      room: {
        code: "ABCD",
        status: "lobby" as const,
        drawerId: null,
        secretWord: null,
        participants: [{ id: "p1", name: "Alice", score: 0, joinedAt: "" }],
        currentRound: 0,
        hostId: "p1",
        availableWords: [],
        roles: ["drawer" as const, "guesser" as const]
      },
      participantId: "p1",
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(WordDisplay));

    expect(container.innerHTML).toBe("");
    cleanup();
  });

  it("renders nothing when there is no room", () => {
    mockUseRoomState.mockReturnValue({
      room: null,
      participantId: null,
      error: null,
      isLoading: false,
      isPolling: false,
      lastPollError: null
    });

    const { container, cleanup } = render(createElement(WordDisplay));

    expect(container.innerHTML).toBe("");
    cleanup();
  });
});
