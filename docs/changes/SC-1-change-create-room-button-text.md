## Summary

Rename create room button to New Room

## What changed

- Changed the Start page's create-room link label to `New Room`.
- Preserved its destination and existing room-creation flow.

## Decisions

- Used title case to match the adjacent `Join Room` button. The create-room page title and submit button are unchanged.
- Kept the existing room creation behavior and verified navigation through the application's actual routes.

## How each criterion is met

- The create room button reads `New Room`: `StartPage > shows New Room and navigates to the create room page` checks the rendered link and its destination, then clicks it and checks the actual create-room page.

## How to verify

Start the frontend and backend as described in the README. On the Start screen, check that `New Room` appears and opens the create-room page.

## Tests

- Updated `frontend/src/pages/StartPage.test.tsx` to exercise the real routes and create-room page rather than a test-only destination.
- Frontend: `node node_modules/vitest/vitest.mjs run` passed (3 tests, with React Router v7 future-flag warnings); `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` passed; `node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build` passed.
- Backend: `node node_modules/vitest/vitest.mjs run` passed (4 tests); `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` and `node node_modules/typescript/bin/tsc -p tsconfig.json` passed.
- `npm test` and `npm run build` in each package could not execute the installed `.bin` symlinks (operation not permitted); the equivalent direct commands above passed. Root `npm test`, `npm run build`, and `npm run lint` failed because there is no root package.json.
- `npm run lint` in both packages failed because neither defines a lint script.

## Docs updated

- README quick verification now names the `New Room` button. No API or agent instruction changes were needed.

## Open questions

None.
