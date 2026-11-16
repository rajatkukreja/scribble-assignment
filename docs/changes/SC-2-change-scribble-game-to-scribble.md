## Summary

Rename start page heading to Scribble

## What changed

Changed the start page heading from “Scribble Game” to “Scribble”.

## Decisions

Kept other uses of “game” that describe gameplay; the browser title already says “Scribble”.

## How each criterion is met

- The start page displays “Scribble” without “Game”: `StartPage > shows Scribble as the start page heading` checks the rendered heading exactly.

## How to verify

Run `cd frontend && npm test`, or start the frontend with `npm run dev` and check the start page heading.

## Tests

- Added `frontend/src/pages/StartPage.test.tsx` to check the rendered heading.
- Frontend `npm test`: 3 tests passed; `npm run build` and `npx tsc --noEmit -p tsconfig.json` passed.
- Backend `npm test`: 4 tests passed; `npm run build` and `npx tsc --noEmit -p tsconfig.json` passed.
- `npm run lint` in each app could not run: neither defines a lint script.
- An initial `npm test` at the repository root failed because there is no root `package.json`; both app suites were run successfully instead.
- `git diff --check` passed.

## Docs updated

Updated the README quick verification step to include the heading.

## Open questions

None.
