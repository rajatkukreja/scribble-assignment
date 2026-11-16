## Summary

Fix room joining to reach the lobby

## What changed

Corrected the default frontend API base URL so room requests reach the backend. Added route-level coverage of joining and the existing lobby navigation.

## Decisions

The starter already navigates to the lobby on a successful join and displays the returned room snapshot, so that flow was reused. Lobby refresh remains manual; game start and polling are outside this ticket.

## How each criterion is met

- A player who joins is sent to the lobby: `joining a room > sends a joined player to the lobby with the room and participants` verifies the request URL, navigation, room code and participant list.
- An unsuccessful join stays on the form: `joining a room > stays on the join form and shows an error when joining fails`.

## How to verify

Start the backend and frontend as described in README.md. Create a room, then join its code in another tab. Confirm the joiner sees the lobby, code and participants. Try an invalid code and confirm an error is shown on the join form.

## Tests

- Added two frontend route-level tests for successful and unsuccessful joins; frontend `npm test`: 4 passed. React Router printed its existing v7 migration warnings.
- Backend `npm test`: 4 passed.
- Frontend and backend `npm run build` and `npx tsc --noEmit` (backend: `npx tsc -p tsconfig.json --noEmit`): passed.
- `npm run lint --if-present` in both packages: no lint script is configured.
- An initial root `npm test` failed because there is no root package.json. Initial package test runs failed because this workspace's SSHFS mount would not resolve `.bin` symlinks; local ignored `node_modules/.bin` wrappers were used for the successful runs.

## Docs updated

README.md documents join navigation and error behavior; this change note records verification.

## Open questions

None.
