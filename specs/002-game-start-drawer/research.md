# Research: Game Start & Drawer Flow

**Phase**: 0 — Technical Research
**Date**: 2026-05-29

## Overview

Consolidates research findings for the Game Start & Drawer Flow feature. All
Technical Context fields were resolvable from existing project knowledge — no
NEEDS CLARIFICATION markers remained.

## Decisions

### Name Validation (Trim + Reject Empty)

- **Decision**: Trim whitespace on input via Zod `.trim()` transformation; chain
  with `.min(1)` to reject empty after trim. Apply in the same Zod schema used
  for `POST /rooms` and `POST /rooms/:code/join`.
- **Rationale**: Leverages existing Zod validation middleware. Zero new
  dependencies. Rejects `"   "` as invalid while `" Alice "` becomes `"Alice"`.
- **Alternatives considered**: Manual `.trim()` in service layer — redundant,
  since Zod can do it declaratively.

### Drawer Assignment (Rotation)

- **Decision**: When the host starts the game, assign a drawer by selecting the
  player who has drawn the fewest times (round-robin). For the first round of
  a game session, pick the first player in the participant list (deterministic).
- **Rationale**: Deterministic (given same player list, same drawer). Fair
  over multiple rounds. Simple to implement with a `timesDrawn` counter per
  player in the Room model.
- **Alternatives considered**: Random selection — violates determinism
  constraint. Alphabetical — too predictable and unfair for varying names.

### Deterministic Word Selection

- **Decision**: Hash the room code (string) concatenated with the round number
  using a simple DJB2 or FNV-1a hash, then modulo against the word pool size.
  Store the word pool as a sorted array in the backend.
- **Rationale**: Deterministic — same room code + round number always yields
  same word. No external dependencies needed. FNV-1a is fast and produces
  good distribution for short strings.
- **Alternatives considered**: CRC32 — heavier than needed. SHA-1 subset —
  overkill. Math.random() — non-deterministic.

### Word Pool

- **Decision**: Hard-coded array of ~50 common English nouns (3-10 chars) in
  the backend `wordService.ts`. Easy to add more words later.
- **Rationale**: No database means words must be in-memory. Hard-coded is the
  simplest approach for MVP. Can be externalized to a JSON file later.
- **Alternatives considered**: Fetch from external API — adds network
  dependency and latency. File-based word list — same as hard-coded but in
  separate file.

### Drawer-Only Word Visibility

- **Decision**: The `GET /rooms/:code/state` endpoint returns the secret word
  ONLY when the requesting `participantId` matches the current drawer's ID.
  Non-drawers get the same response with `secretWord` omitted (or set to null).
- **Rationale**: Server-side filtering guarantees non-drawers cannot inspect
  network responses or client storage to find the word. Clean separation of
  concerns.
- **Alternatives considered**: Client-side filtering — insecure, non-drawer
  could inspect JS memory/debugger. Encryption — overkill, adds latency.

### Game State Machine

- **Decision**: Extend `Room.status` from `"lobby"` to include `"drawing"` and
  `"result"`. Transitions: `lobby → drawing → result → drawing → result → ...`
- **Rationale**: The constitution mandates this state machine. Simple string
  enum on the Room model.
- **Alternatives considered**: Separate `Round` entity with its own status —
  more flexible but unnecessary for v1.

### API Endpoint for Game Start

- **Decision**: `POST /rooms/:code/start` — same endpoint from the lobby
  contract, but now transitions room to `"drawing"` and returns game state.
- **Rationale**: Consistent REST pattern. Extends the existing endpoint rather
  than creating a new one with identical auth logic.
- **Alternatives considered**: `POST /rooms/:code/game/start` — more nested,
  inconsistent with existing routes.

### Polling for Game State

- **Decision**: Reuse the existing polling mechanism (GET /rooms/:code) but
  extend its response to include round info and the secret word (for drawer).
  Frontend transitions from lobby polling to game state polling when
  `room.status === "drawing"`.
- **Rationale**: Single polling endpoint reduces complexity. The frontend
  already has polling infrastructure in the lobby; extend it rather than
  duplicate.
- **Alternatives considered**: Separate `/rooms/:code/game` endpoint — more
  RESTful but adds an extra request per poll cycle.

## Dependencies

### Existing (no changes needed)

- `express`, `express-zod-api` — backend routing
- `react`, `react-dom`, `react-router-dom` — frontend
- `zod` — validation
- `vitest` — testing
- `zustand` — state management

### New Dependencies Needed

- None — all required functionality uses existing imports

## Best Practices

### Server-side Word Filtering

Ensure the GET /rooms/:code endpoint explicitly checks `participantId` before
attaching `secretWord` to the response. Add a test that verifies a non-drawer
participant receives `secretWord: null` or no `secretWord` field.

### Deterministic Hashing

Use a string hash function (e.g., FNV-1a) that produces consistent results
across Node.js versions. Avoid `crypto.createHash` for this use case — it's
more complex than needed for a simple modulo distribution.

### Frontend Game State Handling

When polling returns `status: "drawing"`, the frontend should:
1. Check if `participantId === room.drawerId` to determine role
2. If drawer: show the `secretWord` and drawing canvas
3. If non-drawer: show "waiting for drawing" and guessing input
