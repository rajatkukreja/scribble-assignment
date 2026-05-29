# Tasks: Game Start & Drawer Flow

**Input**: Design documents from `/specs/002-game-start-drawer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per Constitution Principle V. Contract and integration tests MUST be included for every feature group. Test tasks MUST follow the test-first approach (write, observe failure, then implement).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below assume the monorepo web app structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project state before making changes

- [ ] T001 Verify both apps build and existing tests pass (`cd backend && npm run build && npm test` and `cd frontend && npm run build && npm test`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Extend Room model types in `backend/src/models/game.ts` — add `"drawing" | "result"` to `RoomStatus`; add `currentRound`, `drawerId`, `secretWord`, `drawCounts` fields to `Room` interface; add `score` field to `Participant` interface; add `roundStatus` to a new `Round` interface
- [ ] T003 [P] Create `backend/src/services/wordService.ts` — export a sorted word pool (~50 words, 3-10 chars) and a deterministic `selectWord(code: string, round: number): string` function using FNV-1a hash; export `listWords(): string[]`
- [ ] T004 [P] Update frontend API types in `frontend/src/services/api.ts` — extend `RoomSnapshot.status` to `"lobby" | "drawing" | "result"`; add optional `secretWord`, `drawerId`, `currentRound` fields; add `score` to `Participant`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Player Name Validation (Priority: P1) 🎯 MVP

**Goal**: Player names are trimmed on input and empty/whitespace-only names are rejected with a clear error.

**Independent Test**: On the Create Room or Join Room screen, submit a name like `"  Alice  "` and confirm it is stored as `"Alice"`. Submit an empty name and confirm an error is shown and the action is prevented.

### Tests for User Story 1 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T005 [P] [US1] Contract test for name validation on POST /rooms in `backend/src/api/schemas.test.ts` — verify trim + min(1) rejects whitespace-only and empty names
- [ ] T006 [P] [US1] Integration test for name trimming end-to-end — verify `"  Alice  "` is stored as `"Alice"` via POST /rooms

### Implementation for User Story 1

- [ ] T007 [US1] Backend: Verify `playerNameSchema` in `backend/src/api/schemas.ts` already applies `.trim().min(1)` to both create and join routes — already done; no changes needed unless testing reveals gaps
- [ ] T008 [US1] Frontend: Add name validation error display in `frontend/src/pages/CreateRoomPage.tsx` — show the API error message when name is rejected (empty/whitespace)
- [ ] T009 [US1] Frontend: Add name validation error display in `frontend/src/pages/JoinRoomPage.tsx` — show the API error message when name is rejected (empty/whitespace)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Game Start with Drawer Assignment (Priority: P1)

**Goal**: When the host starts the game (>= 2 players), a drawer is assigned, a secret word is selected, and all players transition to the game screen.

**Independent Test**: Create a room, have a second player join, start the game as host. Confirm both players see the game screen and one is designated as the drawer.

### Tests for User Story 2 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T010 [P] [US2] Contract test for POST /rooms/:code/start game state transition in `backend/src/api/schemas.test.ts` — verify room status changes to "drawing", drawerId is set, currentRound is 1
- [ ] T011 [P] [US2] Unit test for drawer rotation in `backend/src/services/roomStore.test.ts` — verify consecutive rounds never assign the same drawer
- [ ] T012 [P] [US2] Unit test for word selection determinism — verify same (code, round) pair always returns same word from wordService

### Implementation for User Story 2

- [ ] T013 [P] [US2] Backend: Create `backend/src/services/gameService.ts` — implement `assignDrawer(participants, drawCounts): string` (round-robin, fewest draws first) and `startRound(room): Room` (set status="drawing", increment round, assign drawer, select word)
- [ ] T014 [P] [US2] Backend: Update `backend/src/services/roomStore.ts` — extend `startGame()` to call gameService, set `room.status = "drawing"`, `room.currentRound = 1`, `room.drawerId`, `room.secretWord`; update `toRoomSnapshot()` to include `currentRound`, `drawerId`, participant `score`; add `submitGuess(code, participantId, guess): SubmitGuessResult` function
- [ ] T015 [US2] Backend: Wire game start in `backend/src/api/rooms.ts` — verify POST /:code/start handler already calls `startGame()` and returns snapshot (change `toRoomSnapshot` call to pass `participantId` for word filtering)
- [ ] T016 [US2] Frontend: Extend `frontend/src/state/roomStore.ts` — update polling to detect `status === "drawing"` and expose game state (currentRound, drawerId) in store
- [ ] T017 [US2] Frontend: Update `frontend/src/pages/GamePage.tsx` — pull round info and drawer designation from store; display round number and who the drawer is; distinguish drawer vs guesser view
- [ ] T018 [US2] Frontend: Update `frontend/src/pages/LobbyPage.tsx` — already navigates to `/game` on start; verify polling continues seamlessly across the navigation transition

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Drawer-Only Word Visibility (Priority: P1)

**Goal**: The drawer sees the secret word on their screen. Non-drawers do not see the word in UI, network responses, or page source.

**Independent Test**: Start a game in two browser tabs. Confirm the drawer tab shows the word. Confirm the guesser tab does NOT show the word or any revealing info (including network inspection).

### Tests for User Story 3 ⚠️

> **NOTE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T019 [P] [US3] Contract test for word visibility filtering in `backend/src/api/schemas.test.ts` — verify GET /rooms/:code returns `secretWord` for drawer participantId and omits it for non-drawer
- [ ] T020 [P] [US3] Unit test for `toRoomSnapshot` word filtering in `backend/src/services/roomStore.test.ts` — verify secretWord is present only when viewerParticipantId matches drawerId
- [ ] T021 [P] [US3] Frontend component test for `WordDisplay` in `frontend/src/tests/` — verify drawer sees word, guesser sees waiting state

### Implementation for User Story 3

- [ ] T022 [US3] Backend: Update `backend/src/services/roomStore.ts` — modify `toRoomSnapshot()` to include `secretWord` only when `viewerParticipantId === room.drawerId`; omit or set null otherwise
- [ ] T023 [P] [US3] Frontend: Create `frontend/src/components/WordDisplay.tsx` — component that shows the word prominently if user is drawer, or a "waiting for drawer to draw..." indicator if guesser
- [ ] T024 [P] [US3] Frontend: Update `frontend/src/pages/GamePage.tsx` — integrate WordDisplay component; show correct view based on whether current participant is drawer or guesser
- [ ] T025 [US3] Frontend: Update `frontend/src/services/api.ts` — add `submitGuess` method to api object for POST /rooms/:code/guess

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T026 [P] Run all backend tests and fix any failures (`cd backend && npm test`)
- [ ] T027 [P] Run all frontend tests and fix any failures (`cd frontend && npm test`)
- [ ] T028 [P] Run lint and build on both apps to verify zero errors
- [ ] T029 Run quickstart.md validation — manually walk through each test scenario
- [ ] T030 Update AGENTS.md if new technology decisions need recording

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational completion — no dependencies on other stories
- **US2 (Phase 4)**: Depends on Foundational completion — no dependencies on other stories
- **US3 (Phase 5)**: Depends on US2 (game must be running for word visibility)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — can be implemented and tested without US2 or US3
- **US2 (P1)**: Independent — can be implemented and tested without US1 or US3
- **US3 (P1)**: Depends on US2 — requires game start and drawer assignment to be functional

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints/UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T002, T003, T004)
- All US1 tasks marked [P] can run in parallel (T005, T006)
- All US2 tasks marked [P] can run in parallel (T010, T011, T012) and (T013, T014)
- All US3 tasks marked [P] can run in parallel (T019, T020, T021) and (T023, T024)
- All Polish tasks marked [P] can run in parallel (T026, T027, T028)
- US1 and US2 can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Contract test for POST /rooms/:code/start in backend/src/api/schemas.test.ts"
Task: "Unit test for drawer rotation in backend/src/services/roomStore.test.ts"
Task: "Unit test for word selection determinism"

# Launch all implementation tasks for User Story 2 together:
Task: "Create gameService.ts with drawer assignment and round start"
Task: "Update roomStore.ts with game start logic and toRoomSnapshot game fields"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Player Name Validation)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (MVP!)
3. Add US2 → Test independently → Deploy/Demo
4. Add US3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (quick win)
   - Developer B: US2 (heavier lift)
3. After US2 done:
   - Developer A or B: US3
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
