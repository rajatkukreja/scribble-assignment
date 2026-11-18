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

- The existing `frontend/src/pages/StartPage.test.tsx` test exercises the real routes and asserts that the sole create-room link has the new label.
- Reran frontend `npm test`: passed (3 tests; React Router v7 future-flag warnings). `npm run build` and `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` passed.
- Reran backend `npm test`: passed (4 tests). `npm run build` and `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` passed.
- `npm run lint` in both packages could not run: neither defines a lint script. Neither defines a typecheck script, so the explicit TypeScript checks above were used.
- Root `npm test` and `npm run lint` could not run because there is no root package.json.

## Docs updated

- README quick verification now names the `New Room` button. No API or agent instruction changes were needed.

## Open questions

None.
