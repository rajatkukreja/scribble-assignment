# Implementation Plan: Game Start & Drawer Flow

**Branch**: `002-game-start-drawer` | **Date**: 2026-05-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-start-drawer/spec.md`

## Summary

Extend the existing room/lobby system with game start mechanics: validate player names (trim, reject empty), assign a drawer when the host starts the game, select a secret word deterministically from a seed pool, and expose the word only to the drawer via HTTP polling responses.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Express 4.x (backend), React 18 + Vite 6.x (frontend), Zod (validation)  
**Storage**: In-memory — `Map<string, Room>` in backend; no database  
**Testing**: Vitest (backend + frontend)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (monorepo: `backend/` + `frontend/`)  
**Performance Goals**: Game start transition under 3 seconds; polling at ~2s intervals (consistent with existing lobby pattern)  
**Constraints**: No WebSockets (HTTP polling only); no database; no auth; all game state in-memory; deterministic word selection  
**Scale/Scope**: Single-server, ~10-50 concurrent rooms; ~5-10 players per room

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Rationale |
|------|--------|-----------|
| I. Type Safety & Strict Typing | ✅ PASS | All entities and API contracts will use explicit TypeScript types. No `any`. New fields on existing types (Room, Player) will be strictly typed. |
| II. Modular Architecture | ✅ PASS | Backend: new game service in `src/services/`, game endpoints in `src/api/`, model extensions in `src/models/`. Frontend: new game components in `src/components/`, state updates in existing store. |
| III. AI-Assisted Development Discipline | ✅ PASS | No unauthorized dependencies, no WebSockets, no databases, no auth introduced. |
| IV. Self-Review & Quality Gates | ✅ PASS | Acceptance scenarios in spec.md define testable outcomes. Build, lint, and test commands will be run. |
| V. Testing & Deterministic Validation | ✅ PASS | Word selection is deterministic (seeded by room code + round number). All game logic testable without network. Contract tests for new endpoints. |
| Game Logic: name trimming | ✅ PASS | FR-001/FR-002 in spec align with constitution requirement. |
| Game Logic: deterministic word selection | ✅ PASS | FR-005 in spec mandates deterministic selection from seed word list. |
| Game Logic: round transitions | ✅ PASS | Round flow (`lobby → drawing → result → lobby`) matches constitution. This feature covers the `lobby → drawing` transition. |

**Result**: All gates pass. No unjustified complexity. Complexity tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-drawer/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research & technical decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: run/test instructions
├── contracts/           # Phase 1: API contracts
│   └── game-api.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── room.ts          # EXTEND: add game status, round info, drawer, secretWord
│   │   └── player.ts        # EXTEND: add score
│   ├── services/
│   │   ├── roomService.ts   # EXTEND: add game start logic
│   │   ├── gameService.ts   # NEW: drawer assignment, word selection, round management
│   │   └── wordService.ts   # NEW: deterministic word pool & selection
│   └── api/
│       ├── roomRoutes.ts    # EXTEND: add POST /rooms/:code/start
│       ├── gameRoutes.ts    # NEW: GET /rooms/:code/state, POST /rooms/:code/guess
│       └── validation.ts    # EXTEND: add name validation schemas
└── tests/
    ├── services/
    │   ├── gameService.test.ts    # NEW
    │   └── wordService.test.ts    # NEW
    └── api/
        └── gameRoutes.test.ts     # NEW

frontend/
├── src/
│   ├── components/
│   │   ├── Lobby.tsx        # EXTEND: wire host start button to API
│   │   ├── GameScreen.tsx   # NEW: game canvas / round display
│   │   ├── WordDisplay.tsx  # NEW: drawer-only word visibility
│   │   └── PlayerNameInput.tsx # NEW (or EXTEND existing): trimmed validation
│   ├── state/
│   │   └── roomStore.ts     # EXTEND: add game state, round, drawer info
│   └── services/
│       └── api.ts           # EXTEND: add startGame, getGameState endpoints
└── tests/
    └── components/
        └── WordDisplay.test.tsx   # NEW
```

**Structure Decision**: Standard monorepo web app layout matching the existing pattern: backend Express API + frontend React SPA. New files follow established naming and location conventions. No new top-level directories required.

## Complexity Tracking

> *Not needed — all gates pass, no unjustified complexity.*
