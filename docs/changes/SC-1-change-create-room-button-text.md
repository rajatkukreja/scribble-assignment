## Summary

Rename create room button to New Room

## What changed

- Changed the Start page's create-room link label to `New Room`.
- Preserved its destination and existing room-creation flow.

## Decisions

- Used title case to match the adjacent `Join Room` button. The create-room page title and submit button are unchanged.
- Kept the existing room creation behavior and verified navigation through the application's actual routes.

## How each criterion is met

- The create room button reads `New Room`: `StartPage > shows New Room and navigates to the create room page` checks that the single create-room link has the new label, then clicks it and checks the actual create-room page.

## How to verify

Start the frontend and backend as described in the README. On the Start screen, check that `New Room` appears and opens the create-room page.

## Tests

- Updated `frontend/src/pages/StartPage.test.tsx` to exercise the real routes and assert the sole create-room link has the new label.
- Frontend: `npm test` passed (3 tests, with React Router v7 future-flag warnings); `npm run build` and `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` passed.
- Backend: `npm test` passed (4 tests); `npm run build` and `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` passed.
- Root `npm test`, `npm run build`, `npm run typecheck`, and `npm run lint` failed because there is no root package.json. Neither package defines a typecheck or lint script; the explicit TypeScript checks above passed, but lint could not be run.

## Docs updated

- README quick verification now names the `New Room` button. No API or agent instruction changes were needed.

## Open questions

None.
