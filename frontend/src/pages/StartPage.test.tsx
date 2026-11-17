import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StartPage } from "./StartPage";

describe("StartPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows New Room and navigates to the create room page", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      act(() => {
        root.render(
          <MemoryRouter initialEntries={["/"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/create-room" element={<p>Create room destination</p>} />
            </Routes>
          </MemoryRouter>
        );
      });

      const link = Array.from(container.querySelectorAll("a")).find(
        (element) => element.textContent?.trim() === "New Room"
      );
      expect(link).toBeDefined();
      expect(link?.getAttribute("href")).toBe("/create-room");
      expect(container.textContent).not.toContain("Create Room");

      act(() => {
        link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
      });
      expect(container.textContent).toContain("Create room destination");
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });
});
