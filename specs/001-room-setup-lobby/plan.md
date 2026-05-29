# Implementation Plan: Room Setup & Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-05-29 | **Spec**: specs/001-room-setup-lobby/spec.md
**Input**: Feature specification from `specs/001-room-setup-lobby/spec.md`

## Summary

Add host tracking to room creation, validate join requests with clear errors,
ensure multi-room isolation, implement automatic lobby polling at ~2s intervals,
and enforce host-only game start with a 2-player minimum.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Express 4.x (backend), React 18 + Vite 6.x (frontend), Zod (validation), Vitest (testing)
**Storage**: In-memory only (no database) — `Map<string, Room>` in backend
**Testing**: Vitest (both backend and frontend)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Lobby polling round-trip completes within 3 seconds; participant list updates visible within 3 seconds of a join
**Constraints**: No WebSockets — HTTP polling only; no databases — in-memory only; no authentication or sessions
**Scale/Scope**: Educational lab — 2-10 simultaneous players, single room at a time per player

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I — Type Safety**: All new types, schemas, and handler signatures MUST have explicit TypeScript types. No `any` permitted.

**Principle II — Modular Architecture**: Backend changes MUST follow `api -> services -> models` layering. Frontend changes MUST use functional components with hooks.

**Principle III — AI Discipline**: All generated code MUST be reviewed before committing. No unauthorized dependencies, WebSockets, databases, or auth.

**Principle IV — Quality Gates**: Code MUST compile (`npm run build` in both apps), linter zero warnings, tests pass, no browser console errors, spec match verified.

**Principle V — Testing**: Contract tests for new/changed endpoints and integration tests for user journeys are required. Test-first approach.

**Game Logic Constraints**: Player names trimmed, empty rejected. Room state deterministic.

**Result**: ALL GATES PASS — no violations. Feature aligns with existing architecture and all constitution rules.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── room-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Add hostId to Room, hostId to RoomSnapshot
│   ├── services/
│   │   └── roomStore.ts         # Add host assignment, startGame()
│   └── api/
│       ├── rooms.ts             # Update handlers, add start endpoint
│       ├── schemas.ts           # Add startGameSchema, richer error responses
│       └── schemas.test.ts      # Update tests
│
frontend/
├── src/
│   ├── services/
│   │   └── api.ts               # Add pollLobby(), startGame()
│   ├── state/
│   │   └── roomStore.ts         # Add host state, polling logic
│   ├── pages/
│   │   ├── CreateRoomPage.tsx    # Handle host response
│   │   ├── JoinRoomPage.tsx      # Handle validation errors
│   │   └── LobbyPage.tsx         # Add polling, start button, host badge
│   └── components/
│       ├── RoomCodeBadge.tsx     # Show room code prominently
│       └── Card.tsx              # Reusable card component
```

**Structure Decision**: Web application (Option 2) — backend + frontend split matching
existing project structure. All new code follows established layering conventions.

## Complexity Tracking

> No constitution violations — Complexity Tracking not required.
