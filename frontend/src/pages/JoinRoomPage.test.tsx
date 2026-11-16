import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const room = {
  code: "ABCD",
  status: "lobby",
  participants: [
    { id: "p1", name: "Alice", joinedAt: "2025-01-01" },
    { id: "p2", name: "Bob", joinedAt: "2025-01-01" }
  ],
  availableWords: [],
  roles: []
};

describe("joining a room", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("fetch", vi.fn());
    window.history.replaceState({}, "", "/join-room");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root.render(<App />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function submitJoin() {
    const inputs = container.querySelectorAll("input");
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    await act(async () => {
      setValue.call(inputs[0], "Bob");
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      setValue.call(inputs[1], "abcd");
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  }

  it("sends a joined player to the lobby with the room and participants", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ participantId: "p2", room })
    } as Response);

    await submitJoin();

    expect(fetch).toHaveBeenCalledWith("http://localhost:3001/rooms/ABCD/join", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ playerName: "Bob" })
    }));
    expect(window.location.pathname).toBe("/lobby");
    expect(container.textContent).toContain("Lobby");
    expect(container.textContent).toContain("ABCD");
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
  });

  it("stays on the join form and shows an error when joining fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Room not found" })
    } as Response);

    await submitJoin();

    expect(window.location.pathname).toBe("/join-room");
    expect(container.textContent).toContain("Room not found");
  });
});
