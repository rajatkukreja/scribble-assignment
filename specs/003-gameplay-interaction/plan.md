# Implementation Plan: Gameplay Interaction

**Branch**: `003-gameplay-interaction` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-gameplay-interaction/spec.md`

## Summary

Add interactive drawing canvas (color palette, brush widths, clear canvas), guess submission with validation (non-empty, no dupes, drawer-blocked), synced guess history via HTTP polling, and deterministic round-end scoring with progressive point values for correct guessers and drawer bonuses.

## Technical Context

**Language/Version**: TypeScript 5.6+ (strict mode)  
**Primary Dependencies**: Express 4.x, React 18.x, Zod 3.x, Vitest 3.x  
**Storage**: In-memory only (`Map<string, Room>`) — no database  
**Testing**: Vitest (backend + frontend), jsdom for frontend component tests  
**Target Platform**: Node.js 18+ (backend), modern browsers Chrome/Firefox/Safari (frontend)  
**Project Type**: Web application — Express REST API backend + React SPA frontend  
**Performance Goals**: Guess submission feedback < 2s, guess history sync < 3s, canvas stroke sync within 1 poll cycle (2s)  
**Constraints**: No WebSockets/Socket.io, no databases, no authentication, no WebRTC; all sync via HTTP polling (2s interval)  
**Scale/Scope**: Single game room with 2–10 players; no horizontal scaling needed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design. *(Re-checked 2026-06-01: same gates apply. No new violations.)*

### Gates

| Gate | Status | Notes |
|------|--------|-------|
| **I. Type Safety** | PASS | All new code fully typed; no `any`; existing strict TS config. |
| **II. Modular Architecture** | PASS | Canvas, guess, and score logic belong in backend `services/`; new components in frontend `components/`. |
| **III. AI Discipline** | PASS | No WebSockets, databases, or auth introduced. Drawing sync uses existing HTTP polling pattern. |
| **IV. Self-Review** | PASS | Tests will be written before implementation; linting and build steps will be run. |
| **V. Test & Deterministic** | PASS | Scoring is deterministic (same input → same output per spec FR-019). New tests required. |
| **VI. Game Logic: Scoring** | **VIOLATION** | Constitution says "exactly 100 per correct guess, 0 otherwise". Spec FR-020 defines progressive scoring (10/8/6/4/3 + drawer 5pts per correct guesser). |

### Violation Justification

**Scoring formula** — The constitution's "exactly 100" rule was a placeholder. The user explicitly requested "deterministic scoring" as a feature requirement. The spec's progressive formula is still fully deterministic (same inputs → same output every time), rewards faster guessers, and incentivizes the drawer. This requires a constitution amendment to replace the scoring clause.

**Amendment needed**: Replace `Scoring MUST be exactly 100 for a correct guess and 0 otherwise — no partial credit, no bonuses.` with language permitting the spec-defined progressive formula.

## Project Structure

### Documentation (this feature)

```text
specs/003-gameplay-interaction/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — technology decisions
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — developer setup
├── contracts/           # Phase 1 — API contracts
└── tasks.md             # Phase 2 — implementation tasks (speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── rooms.ts        ← extend: canvas save/clear endpoints, guesses in snapshot
│   │   └── schemas.ts      ← extend: guess validation, canvas schema
│   ├── models/
│   │   └── game.ts         ← extend: Guess, CanvasStroke, CanvasState, Score entities
│   ├── services/
│   │   ├── gameService.ts  ← extend: endRound scoring, score calculation
│   │   ├── roomStore.ts    ← extend: guess history, canvas state persistence
│   │   └── wordService.ts  ← unchanged
│   └── seed/
│       └── starterData.ts  ← possibly extend word pool
│
frontend/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx          ← NEW: interactive drawing canvas
│   │   ├── ClearCanvasButton.tsx ← NEW: clear canvas + confirm dialog
│   │   ├── ColorPalette.tsx    ← NEW: color picker
│   │   ├── BrushWidthSelector.tsx ← NEW: brush size selector
│   │   ├── GuessHistory.tsx    ← NEW: live guess history list
│   │   ├── ScoreDisplay.tsx    ← NEW: round-end scores
│   │   ├── GuessForm.tsx       ← extend: wire to real API, show validation errors
│   │   └── WordDisplay.tsx     ← unchanged
│   ├── pages/
│   │   └── GamePage.tsx        ← extend: integrate canvas + guess history + scoreboard
│   ├── services/
│   │   └── api.ts             ← extend: saveCanvas, clearCanvas, guess endpoints
│   ├── state/
│   │   └── roomStore.ts       ← extend: canvas state, guesses in polling
│   └── styles/
│       └── app.css            ← extend: canvas, palette, history styles
```

**Structure Decision**: Web application — expands existing backend three-layer architecture and frontend component structure. All new files follow established conventions.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Progressive scoring (constitution VI) | User explicitly requested deterministic scoring with first-guesser advantage and drawer reward | Flat 100-point scoring already exists but does not meet the spec requirement for nuanced scoring |
