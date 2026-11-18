import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "../routes";
import { RoomStoreProvider } from "../state/roomStore";

describe("StartPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows New Room and navigates to the create room page", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    window.history.replaceState(null, "", "/");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      act(() => {
        root.render(
          <RoomStoreProvider>
            <AppRoutes />
          </RoomStoreProvider>
        );
      });

      const link = Array.from(container.querySelectorAll("a")).find(
        (element) => element.textContent?.trim() === "New Room"
      );
      expect(link).toBeDefined();
      expect(link?.getAttribute("href")).toBe("/create-room");

      act(() => {
        link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
      });
      expect(window.location.pathname).toBe("/create-room");
      expect(container.querySelector("h1")?.textContent).toBe("Create Room");
    } finally {
      act(() => root.unmount());
      container.remove();
      window.history.replaceState(null, "", "/");
    }
  });
});
