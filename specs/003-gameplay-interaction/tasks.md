# Tasks: Gameplay Interaction

**Input**: Design documents from `/specs/003-gameplay-interaction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per Constitution Principle V. Contract and integration tests MUST be included for every feature group. Test tasks MUST follow the test-first approach (write, observe failure, then implement).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — repo exists. This phase validates the development environment.

- [x] T001 Verify backend compiles with `cd backend && npx tsc --noEmit`
- [x] T002 Verify frontend compiles with `cd frontend && npx tsc --noEmit`
- [x] T003 Verify all existing tests pass: `cd backend && npm test && cd ../frontend && npm test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend shared types, models, schemas, and frontend API client that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Add Guess, CanvasStroke, RoundScore types in backend/src/models/game.ts
- [x] T005 [P] Add guess history, canvas strokes, and scores fields to RoomSnapshot in backend/src/models/game.ts
- [x] T006 [P] Add canvas data types (StrokePoint, SaveStrokeBody, ClearCanvasBody) to backend/src/api/schemas.ts
- [x] T007 [P] Add guess validation schemas (duplicate check, length limit, drawer-block) to backend/src/api/schemas.ts
- [x] T008 [P] Extend frontend RoomSnapshot type with currentRoundGuesses, canvasStrokes, roundScores in frontend/src/services/api.ts
- [x] T009 [P] Add saveStroke, clearCanvas, endRound API methods in frontend/src/services/api.ts

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Drawing on the Canvas (Priority: P1) 🎯 MVP

**Goal**: The drawer can draw on an interactive canvas with color/brush selection, clear the canvas (with confirmation), and all changes sync to guessers via polling.

**Independent Test**: A player assigned as drawer can draw strokes, switch colors, change brush width, and clear the canvas. A non-drawer sees the same canvas in real-time (within 2s poll cycle) but cannot draw.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Test canvas stroke save endpoint rejects non-drawer in backend/src/api/schemas.test.ts
- [x] T011 [P] [US1] Test canvas clear endpoint clears strokes only for drawer in backend/src/services/roomStore.test.ts
- [x] T012 [P] [US1] Test canvas stroke data format validation in backend/src/api/schemas.test.ts

### Implementation for User Story 1

- [x] T013 [P] [US1] Create Canvas component with HTML Canvas 2D API in frontend/src/components/Canvas.tsx
- [x] T014 [P] [US1] Create ColorPalette component (8+ colors) in frontend/src/components/ColorPalette.tsx
- [x] T015 [P] [US1] Create BrushWidthSelector component (3 sizes) in frontend/src/components/BrushWidthSelector.tsx
- [x] T016 [P] [US1] Create ClearCanvasButton with confirmation dialog in frontend/src/components/ClearCanvasButton.tsx
- [x] T017 [US1] Implement POST /rooms/:code/canvas/stroke endpoint in backend/src/api/rooms.ts
- [x] T018 [US1] Implement POST /rooms/:code/canvas/clear endpoint in backend/src/api/rooms.ts
- [x] T019 [US1] Implement canvas stroke storage and retrieval in backend/src/services/roomStore.ts
- [x] T020 [US1] Integrate canvas components into GamePage in frontend/src/pages/GamePage.tsx
- [x] T021 [US1] Add canvas rendering from strokes on poll (replay strokes on canvas) in frontend/src/components/Canvas.tsx
- [x] T022 [US1] Add canvas-related CSS styles in frontend/src/styles/app.css

**Checkpoint**: US1 complete — drawer can draw, clear, and sync canvas. Guessers see canvas in real-time.

---

## Phase 4: User Story 2 — Submitting Guesses (Priority: P1)

**Goal**: A guesser can submit guesses with validation (non-empty, no dupes, max 100 chars, drawer-blocked). Correct guesses are detected and reported.

**Independent Test**: A guesser submits a guess and sees it accepted or rejected with feedback. The same guesser cannot submit the same guess twice. The drawer cannot submit guesses.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T023 [P] [US2] Test guess validation (empty, too long, duplicate) in backend/src/api/schemas.test.ts
- [x] T024 [P] [US2] Test guess submission stores in history (no immediate state transition) in backend/src/services/roomStore.test.ts
- [x] T025 [P] [US2] Test drawer cannot submit guess in backend/src/services/roomStore.test.ts

### Implementation for User Story 2

- [x] T026 [US2] Update submitGuess to store guess in currentRoundGuesses array (not immediate scoring) in backend/src/services/roomStore.ts
- [x] T027 [US2] Add duplicate guess detection (per-player, case-insensitive) in backend/src/services/roomStore.ts
- [x] T028 [US2] Update GuessForm component to call real API and show validation errors in frontend/src/components/GuessForm.tsx
- [x] T029 [US2] Disable guess input for drawer role in frontend/src/components/GuessForm.tsx
- [x] T030 [US2] Add guess form styles in frontend/src/styles/app.css

**Checkpoint**: US2 complete — guessers can submit guesses with validation, see accept/reject feedback.

---

## Phase 5: User Story 3 — Seeing Live Guess History (Priority: P2)

**Goal**: All players see a real-time guess history that updates via polling, with correct guesses visually distinguished.

**Independent Test**: Two guessers submit guesses. Both players see all guesses in the history list within 3 seconds. Correct guesses are highlighted.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US3] Test guess history is included in RoomSnapshot in backend/src/services/roomStore.test.ts
- [ ] T032 [P] [US3] Test guess history resets on new round in backend/src/services/roomStore.test.ts
- [ ] T033 [US3] Test GuessHistory component renders guesses in frontend/src/components/GuessHistory.test.tsx (new file)

### Implementation for User Story 3

- [ ] T034 [US3] Expose currentRoundGuesses in toRoomSnapshot in backend/src/services/roomStore.ts
- [ ] T035 [US3] Reset currentRoundGuesses when startRound is called in backend/src/services/gameService.ts
- [ ] T036 [P] [US3] Create GuessHistory component in frontend/src/components/GuessHistory.tsx
- [ ] T037 [P] [US3] Add guess history polling integration in frontend/src/state/roomStore.ts
- [ ] T038 [US3] Integrate GuessHistory into GamePage in frontend/src/pages/GamePage.tsx
- [ ] T039 [US3] Add guess history styles (including correct guess highlighting) in frontend/src/styles/app.css

**Checkpoint**: US3 complete — all players see live guess history with correct guesses distinguished.

---

## Phase 6: User Story 4 — Scoring at Round End (Priority: P2)

**Goal**: At round end, scores are calculated deterministically using the progressive formula. All players see round scores and cumulative totals.

**Independent Test**: Complete a round with 2+ correct guessers. Confirm first gets 10, second gets 8, drawer gets 5pts per correct guesser. Replay identical scenario and confirm identical scores.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T040 [P] [US4] Test calculateRoundScore pure function (first=10, second=8, drawer bonus) in backend/src/services/gameService.test.ts
- [ ] T041 [P] [US4] Test round scores included in snapshot after round end in backend/src/services/roomStore.test.ts
- [ ] T042 [P] [US4] Test scoring is deterministic (same inputs = same outputs) in backend/src/services/gameService.test.ts
- [ ] T043 [US4] Test ScoreDisplay renders correctly for different score scenarios in frontend/src/components/ScoreDisplay.test.tsx (new file)

### Implementation for User Story 4

- [ ] T044 [US4] Implement calculateRoundScore pure function in backend/src/services/gameService.ts
- [ ] T045 [US4] Implement endRound function that calls calculateRoundScore, updates participant scores, sets status=result in backend/src/services/gameService.ts
- [ ] T046 [US4] Expose roundScores in toRoomSnapshot in backend/src/services/roomStore.ts
- [ ] T047 [P] [US4] Create ScoreDisplay component in frontend/src/components/ScoreDisplay.tsx
- [ ] T048 [P] [US4] Add scoreboard polling integration in frontend/src/state/roomStore.ts
- [ ] T049 [US4] Integrate ScoreDisplay into GamePage in frontend/src/pages/GamePage.tsx
- [ ] T050 [US4] Add scoreboard styles in frontend/src/styles/app.css

**Checkpoint**: US4 complete — round-end scoring is deterministic and visible to all players.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge case handling, and validation tasks.

- [ ] T051 [P] Verify canvas strokes persist through poll reconnect (clear canvas + refetch)
- [ ] T052 [P] Verify guess history persists through poll reconnect
- [ ] T053 Run full test suite: `cd backend && npm test && cd ../frontend && npm test`
- [ ] T054 Run lint check: `cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit`
- [ ] T055 Multi-browser manual test: open two tabs, verify canvas syncs, guesses appear, scores match

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US3 (Guess History) depends on US2 (needs guesses stored on server)
  - US4 (Scoring) depends on US2 + US3 (needs guess history for score calculation)
  - US1 (Canvas) is fully independent — can proceed alongside US2
  - US2 (Guesses) is independent of US1
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 — Drawing on the Canvas (P1)**: Independent. Uses new endpoints (canvas/stroke, canvas/clear).
- **US2 — Submitting Guesses (P1)**: Independent. Extends existing guess endpoint.
- **US3 — Guess History (P2)**: Depends on US2 (needs guess data to display).
- **US4 — Scoring (P2)**: Depends on US3 (needs guess history for scoring), depends on US2 (needs correct guess data).

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Backend models + schemas before services
- Backend services before endpoints
- Frontend components after backend endpoints exist
- Story complete before moving to next dependency

### Parallel Opportunities

- T004 and T005 (Foundational models) can run in parallel
- T010-T012 (US1 tests) can all run in parallel
- T013-T016 (US1 frontend components) can all run in parallel
- T023-T025 (US2 tests) can all run in parallel
- US1 and US2 are fully independent and can proceed in parallel
- Within US5: T036 and T037 can run in parallel
- Within US4: T040-T042 (tests) can run in parallel; T047 and T048 (frontend) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test canvas stroke save endpoint rejects non-drawer in backend/src/api/schemas.test.ts"
Task: "Test canvas clear endpoint clears strokes only for drawer in backend/src/services/roomStore.test.ts"
Task: "Test canvas stroke data format validation in backend/src/api/schemas.test.ts"

# Launch all frontend components for User Story 1 together:
Task: "Create Canvas component with HTML Canvas 2D API in frontend/src/components/Canvas.tsx"
Task: "Create ColorPalette component (8+ colors) in frontend/src/components/ColorPalette.tsx"
Task: "Create BrushWidthSelector component (3 sizes) in frontend/src/components/BrushWidthSelector.tsx"
Task: "Create ClearCanvasButton with confirmation dialog in frontend/src/components/ClearCanvasButton.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Test guess validation (empty, too long, duplicate) in backend/src/api/schemas.test.ts"
Task: "Test guess submission stores in history (no immediate state transition) in backend/src/services/roomStore.test.ts"
Task: "Test drawer cannot submit guess in backend/src/services/roomStore.test.ts"

# Launch guess form updates (single file - sequential):
Task: "Update GuessForm component to call real API and show validation errors in frontend/src/components/GuessForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing build)
2. Complete Phase 2: Foundational (extend types/schemas)
3. Complete Phase 3: User Story 1 (drawing canvas)
4. **STOP and VALIDATE**: Drawer draws, guessers see canvas via polling
5. Deploy/demo if ready

### MVP+ Next (User Story 2)

1. Complete Phase 4: User Story 2 (guess submission)
2. Guessers can now draw AND guess

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add US1 (Canvas) → MVP: drawing works, test independently
3. Add US2 (Guesses) → V2: guessing works alongside drawing
4. Add US3 (Guess History) → V3: full guess visibility
5. Add US4 (Scoring) → V4: complete gameplay loop
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Developer A**: Phase 1 + Phase 2 (foundation) → then US1 (Canvas)
2. **Developer B**: Starts US2 (Guesses) once Phase 2 is done
3. **Developer C**: Starts US3 (History) once US2 is done, then US4 (Scoring)

Or with two developers:
1. Both complete Phase 1 + 2 together
2. Developer A: US1 + US3 (frontend-heavy)
3. Developer B: US2 + US4 (backend-logic-heavy)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All tests MUST fail before implementation (test-first per Constitution V)
- Commit after each phase checkpoint
- Stop at any checkpoint to validate story independently
