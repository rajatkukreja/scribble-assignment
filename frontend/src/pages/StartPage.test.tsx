import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";
import { StartPage } from "./StartPage";

describe("StartPage", () => {
  it("shows Scribble as the start page heading", () => {
    const markup = renderToStaticMarkup(
      <StaticRouter location="/">
        <StartPage />
      </StaticRouter>
    );
    const page = new DOMParser().parseFromString(markup, "text/html");

    expect(page.querySelector("h1")?.textContent).toBe("Scribble");
  });
});
