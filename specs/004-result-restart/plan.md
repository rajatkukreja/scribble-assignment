# Implementation Plan: Game Result & Restart

**Branch**: `004-result-restart` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-result-restart/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a shared result state visible to all players (secret word revealed, round scores, correct guesser distinction) and a host-only "Restart to Lobby" action that resets all game state while preserving room membership. The restart endpoint clears scores, rounds, draws, canvas, and guesses, transitioning the room back to `"lobby"` so a fresh game can begin with the same players.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Express 4.x (backend), React 18.x + Vite 6.x (frontend), Zod 3.x (validation), Vitest 3.x (testing)
**Storage**: In-memory only (`Map<string, Room>`) — no database
**Testing**: Vitest (backend unit + integration), testing-library (frontend component)
**Target Platform**: Node.js server + modern web browser
**Project Type**: Full-stack web application (monorepo with `backend/` + `frontend/`)
**Performance Goals**: HTTP polling every 2s; round-trip under 300ms for game actions
**Constraints**: No WebSockets, no database, no authentication, no localStorage/persistent storage
**Scale/Scope**: Hobby-scale multiplayer — single-server in-memory, ~20 concurrent rooms

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| **I. Type Safety** | PASS | New code follows existing typed patterns; no `any` |
| **II. Modular Architecture** | PASS | Backend: `src/api` (route), `src/services` (business logic), `src/models` (types). Frontend: functional components + hooks. |
| **III. AI-Assisted Dev Discipline** | PASS | No unauthorized dependencies, no WebSockets, no databases, no auth |
| **IV. Self-Review Quality Gates** | PASS | Build + lint + test + manual cross-client verification required before merge |
| **V. Testing & Deterministic Validation** | PASS | New `restartGame` function is deterministic — same input always resets same fields |
| **Game Logic: State Transitions** | PASS | Adds `result -> lobby` transition, completing the cycle mandated by the constitution |
| **Game Logic: Scoring** | N/A | No scoring changes in this feature |
| **Game Logic: Misc** | PASS | Constitution mentions `result -> lobby` as expected transition — our feature implements it |

**No gate violations.** Complexity is minimal (single new API endpoint, one new store function, one new button).

## Project Structure

### Documentation (this feature)

```text
specs/004-result-restart/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts          # (no changes needed — Room type already has all fields)
│   ├── services/
│   │   ├── roomStore.ts     # + restartGame() function, + result word reveal
│   │   └── gameService.ts   # + (no changes — restart is pure state reset)
│   └── api/
│       ├── rooms.ts         # + POST /:code/restart route handler
│       └── schemas.ts       # + restartSchema (Zod)

frontend/
├── src/
│   ├── components/
│   │   └── ResultPanel.tsx  # + secret word display during result phase
│   ├── pages/
│   │   └── GamePage.tsx     # + "Restart to Lobby" button (host-only, result state)
│   ├── services/
│   │   └── api.ts           # + restartGame() method
│   └── state/
│       └── roomStore.ts     # + restartGame() action
```

**Structure Decision**: Option 2 (Web application — full-stack monorepo with `backend/` + `frontend/`). This matches the existing project structure and requires no structural changes.

## Complexity Tracking

> No violations to track. All gates pass.
