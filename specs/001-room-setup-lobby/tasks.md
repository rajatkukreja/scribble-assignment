---

description: "Task list for Room Setup & Lobby feature"

---

# Tasks: Room Setup & Lobby

**Input**: Design documents from `specs/001-room-setup-lobby/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per Constitution Principle V. Contract and integration tests MUST be included for every feature group. Test tasks MUST follow the test-first approach (write, observe failure, then implement).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown assume web application structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project is clean before making changes

- [ ] T001 [P] Verify both apps build and existing tests pass:
      `cd backend && npm run build && npm test`
      `cd frontend && npm run build && npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Model and schema changes that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Add `hostId` field to `Room` interface and `RoomSnapshot`
      interface in `backend/src/models/game.ts`
- [ ] T003 [P] Update schemas in `backend/src/api/schemas.ts`:
      - Make `playerName` required (non-empty string with trim) in
        `createRoomSchema` and `joinRoomSchema`
      - Add `startGameSchema` with `participantId: z.string()`
      - Update error handler in `backend/src/api/router.ts` to return
        `{ error: string }` format for Zod errors and HTTP errors
      - Update frontend `api.ts` to read `error` field from error responses
        instead of `message` in `frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in
parallel where marked [P]

---

## Phase 3: User Story 1 — Create Room with Host Assignment (Priority: P1)

**Goal**: A player creates a room and is immediately designated as host with a
visible host badge

**Independent Test**: Open the app, click "Create Room", enter a display name,
and confirm the room is created and you are shown as the host on the lobby
screen

### Tests for User Story 1

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T004 [P] [US1] Contract test for `POST /rooms` returning `hostId` in
      response — write test in `backend/src/api/schemas.test.ts` that verifies
      the response shape includes `room.hostId` matching `participantId`
- [ ] T005 [P] [US1] Unit test for `roomStore.createRoom` assigning hostId in
      `backend/src/services/roomStore.test.ts` — verify `result.room.hostId`
      equals `result.participantId`

### Implementation for User Story 1

- [ ] T006 [P] [US1] Update `createRoom` in
      `backend/src/services/roomStore.ts` to assign `hostId` on the Room
      (set to the creator's participant ID)
- [ ] T007 [US1] Update `toRoomSnapshot` in
      `backend/src/services/roomStore.ts` to include `hostId` in the returned
      snapshot
- [ ] T008 [P] [US1] Add `hostId` field to `RoomSnapshot` interface in
      `frontend/src/services/api.ts`
- [ ] T009 [US1] Update `POST /rooms` handler in
      `backend/src/api/rooms.ts` — ensure the 201 response includes `hostId`
      in the room object
- [ ] T010 [US1] Update `CreateRoomPage` in
      `frontend/src/pages/CreateRoomPage.tsx` to navigate to lobby after
      creation (already partially done), pass host context
- [ ] T011 [US1] Update `LobbyPage` in
      `frontend/src/pages/LobbyPage.tsx` to show a "Host" badge next to the
      host participant's name (compare `participant.id` with `room.hostId`)
- [ ] T012 [US1] Verify tests T004 and T005 now pass —
      `cd backend && npm test`

**Checkpoint**: At this point, User Story 1 should be fully functional and
testable independently. Create a room and confirm host badge appears.

---

## Phase 4: User Story 2 — Join Room with Validation (Priority: P1)

**Goal**: A player joins a room with a code; empty, invalid, or non-existent
codes show clear error messages

**Independent Test**: Open the app, try joining with an empty code, a
non-existent code, and a valid code. Confirm appropriate error messages for each
case.

### Tests for User Story 2

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T013 [P] [US2] Unit test for `roomStore.joinRoom` returning distinct
      error types for empty code vs non-existent room in
      `backend/src/services/roomStore.test.ts`
- [ ] T014 [P] [US2] Contract test for `POST /rooms/:code/join` validation
      errors in `backend/src/api/schemas.test.ts` — verify empty code returns
      400 with appropriate error message, non-existent code returns 404

### Implementation for User Story 2

- [ ] T015 [P] [US2] Update `joinRoom` in
      `backend/src/services/roomStore.ts`:
      - Return typed error for empty/whitespace code (rather than generic null)
      - Return typed error for non-existent room
      - Validate playerName is non-empty after trim
- [ ] T016 [US2] Update `POST /rooms/:code/join` handler in
      `backend/src/api/rooms.ts` to map joinRoom errors to appropriate HTTP
      status codes (400 for validation, 404 for not found) with clear
      `{ error: string }` message
- [ ] T017 [US2] Update `JoinRoomPage` in
      `frontend/src/pages/JoinRoomPage.tsx` to display validation error
      messages from the backend response
- [ ] T018 [US2] Verify tests T013 and T014 now pass —
      `cd backend && npm test`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work
independently. Create room, join room with various codes, verify error messages.

---

## Phase 5: User Story 3 — Lobby Polling and Game Start (Priority: P2)

**Goal**: Lobby auto-refreshes participant list via polling; host can start game
with 2+ players; non-hosts cannot start

**Independent Test**: Open two browser tabs. Create room in tab A, join in tab
B. Tab A shows two participants within ~3 seconds. Host can start, non-host
cannot.

### Tests for User Story 3

> NOTE: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T019 [P] [US3] Contract test for `POST /rooms/:code/start` in
      `backend/src/api/schemas.test.ts` — verify:
      - Host can start with 2+ players (200)
      - Non-host cannot start (403)
      - Host cannot start with only 1 player (400)
- [ ] T020 [P] [US3] Unit test for `roomStore.startGame` in
      `backend/src/services/roomStore.test.ts` — verify host check and
      minimum player enforcement

### Implementation for User Story 3

- [ ] T021 [P] [US3] Add `startGame` function to
      `backend/src/services/roomStore.ts`:
      - Accept room code and requesting participant ID
      - Validate requestor is the host (return 403 error if not)
      - Validate >= 2 participants (return 400 error if fewer)
      - Return updated room snapshot on success
- [ ] T022 [US3] Add `POST /rooms/:code/start` endpoint in
      `backend/src/api/rooms.ts`:
      - Parse `participantId` from request body
      - Call `startGame` service
      - Return room snapshot on success
      - Map service errors to HTTP responses with `{ error: string }` format
- [ ] T023 [US3] Implement automatic lobby polling in
      `frontend/src/state/roomStore.ts`:
      - Add `startPolling()` and `stopPolling()` methods
      - `startPolling` calls `fetchRoom` every ~2s using `setInterval`
      - `stopPolling` clears the interval
      - Store polling state (isPolling, lastPollError)
- [ ] T024 [P] [US3] Add `startGame` method to `frontend/src/services/api.ts`
      — sends POST to `/rooms/:code/start` with `participantId` in body
- [ ] T025 [P] [US3] Add `startGame` action to
      `frontend/src/state/roomStore.ts` — calls `api.startGame` and updates
      room state
- [ ] T026 [US3] Update `LobbyPage` in
      `frontend/src/pages/LobbyPage.tsx`:
      - Start polling on mount via `useEffect`
      - Stop polling on unmount (cleanup)
      - Show "Start Game" button only for host (`room.hostId === participantId`)
      - Disable start button / show error when fewer than 2 players
      - Show "Waiting for host to start..." for non-host players
      - Replace manual "Refresh Room" button with auto-polling indicator
- [ ] T027 [US3] Wire up response from `startGame` to navigate to `/game`
      route in `frontend/src/pages/LobbyPage.tsx`
- [ ] T028 [US3] Verify tests T019 and T020 now pass —
      `cd backend && npm test`

**Checkpoint**: All user stories should now work together. Two browsers can
create, join, lobby poll, and host can start the game. Non-host sees no start
button.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and hardening

- [ ] T029 [P] Run full build and lint on both apps:
      `cd backend && npm run build && npm test`
      `cd frontend && npm run build && npm test`
- [ ] T030 End-to-end two-browser manual validation per `quickstart.md` in
      `specs/001-room-setup-lobby/quickstart.md`
- [ ] T031 Verify room isolation: create two rooms in separate browser
      sessions, confirm no cross-room data leakage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user
  stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 -> P1 -> P2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Backend models before services
- Services before endpoints
- Backend before frontend (where applicable)
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002, T003 can run in parallel (all different files)
- T004 and T005 can run in parallel (different test files)
- T006 and T008 can run in parallel (backend model vs frontend types)
- T013 and T014 can run in parallel (different test files)
- T015 and T017 can run in parallel (backend service vs frontend UI)
- T019 and T020 can run in parallel (different test files)
- T021, T023, T024 can run in parallel (backend service, frontend store, frontend API)

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "Contract test for POST /rooms returning hostId in schemas.test.ts"
Task: "Unit test for roomStore.createRoom assigning hostId in roomStore.test.ts"

# Launch model and type changes together:
Task: "Add hostId to models in backend game.ts"
Task: "Add hostId to RoomSnapshot in frontend api.ts"
```

## Parallel Example: User Story 3

```bash
# Launch tests for User Story 3 together:
Task: "Contract test for POST /rooms/:code/start in schemas.test.ts"
Task: "Unit test for roomStore.startGame in roomStore.test.ts"

# Launch backend service, frontend store, and frontend API together:
Task: "Add startGame to roomStore.ts backend"
Task: "Add polling logic to roomStore.ts frontend"
Task: "Add startGame to api.ts frontend"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (create room with host)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories
