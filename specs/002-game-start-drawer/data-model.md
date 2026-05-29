# Data Model: Game Start & Drawer Flow

**Phase**: 1 — Design
**Date**: 2026-05-29

## Entities

### Room (extended)

Represents a single game session. Extended from the lobby feature with game state fields.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `code` | `string` | Unique 4-char alphanumeric identifier | Auto-generated, no duplicates |
| `status` | `"lobby" \| "drawing" \| "result"` | Current room state | Must transition in order: lobby → drawing → result → drawing → ... |
| `hostId` | `string` | Participant ID of the room creator | Set on creation, never changes |
| `participants` | `Participant[]` | Players currently in the room | At least 1 (creator) |
| `currentRound` | `number` | Current round number (0 = not started) | Increments by 1 each round; starts at 1 when game begins |
| `drawerId` | `string \| null` | Participant ID of the current round's drawer | Must be a participant ID; non-null when status is "drawing" or "result" |
| `secretWord` | `string \| null` | The word for the current round | Non-null when status is "drawing" or "result"; selected deterministically |
| `drawCounts` | `Map<string, number>` | Number of times each participant has been drawer | Used for round-robin drawer rotation |
| `createdAt` | `string` (ISO 8601) | When the room was created | Server-set |
| `updatedAt` | `string` (ISO 8601) | When the room was last modified | Server-set on every mutation |

### Participant (extended)

A player in a room. Extended with score tracking.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` (UUID) | Unique participant identifier | Auto-generated |
| `name` | `string` | Display name | Trimmed via Zod; must be non-empty after trim |
| `score` | `number` | Cumulative score across rounds | Starts at 0; incremented by 100 on correct guess |
| `joinedAt` | `string` (ISO 8601) | When the participant joined | Server-set |

### Round

A single round of play within a game session.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `number` | `number` | Round number (1-based) | Sequential within a room |
| `drawerId` | `string` | Participant ID of the drawer | Must be a participant |
| `secretWord` | `string` | The word being drawn | Selected deterministically |
| `status` | `"drawing" \| "result"` | Current round state | drawing → result |

### WordPool

The seed word list used for deterministic word selection.

| Field | Type | Description |
|-------|------|-------------|
| `words` | `string[]` | Sorted array of unique words |
| `hashFunction` | `(code: string, round: number) => number` | Deterministic hash (FNV-1a) to compute word index |

## State Transitions

```
[Host clicks Start]
  lobby (>= 2 players, host only)
    → drawing (drawer assigned, word selected)
      → result (word guessed or timeout)
        → drawing (next round, new drawer, new word)
          → ... (repeats)
            → lobby (game ends, back to room)
```

## Validation Rules (additions to lobby rules)

- Player names: Zod `.trim()` + `.min(1)` applied to all name inputs (create + join)
- Drawer assignment: Must pick participant from current participant list; must not be same as previous round's drawer
- Word selection: Deterministic based on `hash(roomCode + roundNumber) % wordPool.length`
- Game start: Room status must be "lobby"; participant count must be >= 2; requestor must be host
- Secret word: Only included in API response when request participantId === drawerId
