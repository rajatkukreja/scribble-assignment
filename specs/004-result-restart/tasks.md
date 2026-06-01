---

description: "Task list for Game Result & Restart feature"

---

# Tasks: Game Result & Restart

**Input**: Design documents from `specs/004-result-restart/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are MANDATORY per Constitution Principle V. Contract and integration tests MUST be included for every feature group. Test tasks MUST follow the test-first approach (write, observe failure, then implement).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below assume web app structure per plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks required — project infrastructure already exists. All changes are incremental additions to existing files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

No blocking foundational tasks — both user stories add self-contained functionality to the existing codebase without shared new infrastructure.

---

## Phase 3: User Story 1 - Viewing Round Results (Priority: P1) 🎯 MVP

**Goal**: After a round ends, all players see a shared result screen with the secret word revealed, round scores, cumulative scores, and correct guessers distinguished. The secret word is visible to everyone (not just the drawer).

**Independent Test**: Complete a round in a 2-player room. Both browser tabs show the secret word, round scores, and cumulative scores. The correct guesser is visually distinguished from the non-guesser.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T001 [P] [US1] Test toRoomSnapshot reveals secretWord to all viewers when status is "result" in backend/src/services/roomStore.test.ts
- [ ] T002 [P] [US1] Test ResultPanel renders secret word and correct guesser highlight in frontend/src/components/ResultPanel.test.tsx

### Implementation for User Story 1

- [ ] T003 [P] [US1] Update toRoomSnapshot to include secretWord for all viewers when room status is "result" in backend/src/services/roomStore.ts
- [ ] T004 [US1] Update ResultPanel to display the secret word and visually distinguish correct guessers in frontend/src/components/ResultPanel.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The result screen shows the secret word, scores, and correct guesser highlights to all players.

---

## Phase 4: User Story 2 - Restarting to Lobby (Priority: P1)

**Goal**: The host can restart the entire game from the result screen. All players return to the lobby with their names preserved. All game state (scores, rounds, canvas, guesses) is cleared. A fresh game can begin with the same players.

**Independent Test**: Two-player game plays a round. Host clicks "Restart to Lobby". Both players see the lobby with names preserved and scores reset to zero. Host starts a fresh game successfully.

### Tests for User Story 2 ⚠️

- [ ] T005 [P] [US2] Test restartGame resets all round state while preserving participants/host in backend/src/services/roomStore.test.ts
- [ ] T006 [P] [US2] Test POST /:code/restart validates room status, host-only gate, and returns lobby snapshot in backend/src/services/roomStore.test.ts

### Implementation for User Story 2

**Backend:**

- [ ] T007 [P] [US2] Add restartSchema in backend/src/api/schemas.ts
- [ ] T008 [P] [US2] Add restartGame function in backend/src/services/roomStore.ts

  Must reset: scores to 0, currentRound to 0, drawerId to null, secretWord to null, drawCounts to {}, currentRoundGuesses to [], canvasStrokes to [], correctGuessOrder to 0, roundScores to []. Must preserve: participants, hostId, code. Must set status to "lobby".

- [ ] T009 [US2] Add POST /:code/restart route handler in backend/src/api/rooms.ts

  Wire restartSchema validation + restartGame call. Return room snapshot. Gate on host-only, result-state-only.

**Frontend:**

- [ ] T010 [P] [US2] Add restartGame API method in frontend/src/services/api.ts
- [ ] T011 [P] [US2] Add restartGame store action in frontend/src/state/roomStore.ts
- [ ] T012 [US2] Add "Restart to Lobby" button (host-only, result state) in frontend/src/pages/GamePage.tsx

  Button calls store.restartGame(), then navigates to "/lobby" on success.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Result screen shows secret word + scores. Host can restart to lobby where all players are preserved with zero scores.

---

## Phase 5: User Story 3 - Final Validation (Priority: P2)

**Goal**: The result screen is the social moment where players see the outcome prominently. Both "Next Round" and "Restart to Lobby" actions are available to the host. Non-host players see both as unavailable.

**Independent Test**: After a round ends, the result screen prominently displays the secret word and scores. The host sees both "Next Round" and "Restart to Lobby" buttons. A non-host sees neither button as available.

### Implementation for User Story 3

- [ ] T013 [US3] Ensure both "Next Round" and "Restart to Lobby" buttons are visible to host in result state in frontend/src/pages/GamePage.tsx
- [ ] T014 [US3] Ensure non-host players see both action buttons as unavailable during result state in frontend/src/pages/GamePage.tsx

**Checkpoint**: All user stories should now be independently functional. The result screen provides a complete end-of-round experience with all actions available.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T015 [P] Run full test suite to confirm no regressions: cd backend && npm test && cd ../frontend && npm test
- [ ] T016 Run build for both backend and frontend: cd backend && npm run build && cd ../frontend && npm run build
- [ ] T017 Manual cross-client verification: open two browser tabs, play through full game cycle (round → result → restart → new game → round → result), verify consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No dependencies - no blocking prerequisites
- **User Stories (Phase 3+)**: Can start immediately (no foundational dependencies)
  - US1 and US2 are independent of each other - can proceed in parallel
  - US3 depends on both US1 and US2 being complete
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start immediately
- **User Story 2 (P1)**: No dependencies on other stories - can start immediately
- **User Story 3 (P2)**: Depends on US1 (result display UI) and US2 (restart button) being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks within a story can run in parallel when marked [P]
- Core implementation before integration

### Parallel Opportunities

- T001, T002 can run in parallel (different files, different aspects)
- T003, T004 can run in parallel (backend snapshot vs frontend component)
- T005, T006 can run in parallel (both roomStore tests)
- T007, T008, T010, T011 can run in parallel (independent files)
- T009 depends on T007 + T008 (route needs schema + store function)
- T012 depends on T010 + T011 (button needs API method + store action)
- US1 and US2 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test toRoomSnapshot reveals secret word in result state"
Task: "Test ResultPanel renders secret word and highlights"

# Launch all implementation for User Story 1 together:
Task: "Update toRoomSnapshot in roomStore.ts"
Task: "Update ResultPanel.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all backend tasks together:
Task: "Add restartSchema in schemas.ts"
Task: "Add restartGame in roomStore.ts"
Task: "Add restartGame API method in api.ts"
Task: "Add restartGame store action in roomStore.ts (frontend)"

# Then (depends on schema + store):
Task: "Add POST /:code/restart route in rooms.ts"
Task: "Add Restart to Lobby button in GamePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (Viewing Round Results)
2. **STOP and VALIDATE**: Test US1 independently - verify secret word and scores visible to all
3. Deploy/demo if ready

### Incremental Delivery

1. Add User Story 1 (result reveal) → Test independently → Deploy/Demo (MVP!)
2. Add User Story 2 (restart to lobby) → Test independently → Deploy/Demo
3. Add User Story 3 (validation polish) → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With two developers:

1. Developer A: User Story 1 (result reveal - backend + frontend)
2. Developer B: User Story 2 (restart to lobby - backend + frontend)
3. Both stories are independent and can be completed simultaneously
4. Developer A or B: User Story 3 (validation polish) after US1 + US2 complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
