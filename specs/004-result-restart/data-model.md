# Data Model: Game Result & Restart

## Entity: Room (modified fields)

### State Transitions

The existing `RoomStatus` type (`"lobby" | "drawing" | "result"`) gains a new transition:

```
lobby -> drawing -> result -> lobby  (restart — NEW)
                            -> drawing (next round — existing)
```

### Fields Reset by Restart

When the `restartGame` operation runs, these fields on the `Room` object are affected:

| Field | Type | Restart Behavior | Notes |
|-------|------|------------------|-------|
| `status` | `RoomStatus` | Set to `"lobby"` | Transition from result back to lobby |
| `participants[].score` | `number` | Reset to `0` for all participants | Cumulative score wiped |
| `currentRound` | `number` | Reset to `0` | Round counter starts fresh |
| `drawerId` | `string \| null` | Set to `null` | No drawer assigned until next game starts |
| `secretWord` | `string \| null` | Set to `null` | No active word |
| `drawCounts` | `Record<string, number>` | Cleared to empty `{}` | Draw rotation starts fresh |
| `currentRoundGuesses` | `Guess[]` | Cleared to `[]` | No guesses from previous game |
| `canvasStrokes` | `CanvasStroke[]` | Cleared to `[]` | No strokes from previous game |
| `correctGuessOrder` | `number` | Reset to `0` | Guess ordering starts fresh |
| `roundScores` | `RoundScore[]` | Cleared to `[]` | No round scores until next round ends |

### Fields Preserved by Restart

| Field | Type | Notes |
|-------|------|-------|
| `code` | `string` | Room code stays the same |
| `hostId` | `string` | Same player remains host |
| `participants` | `Participant[]` | All players stay in the room |
| `createdAt` | `string` | Original creation time preserved |
| `updatedAt` | `string` | Updated to current time on restart |

## Entity: Result State (view concept)

Not a separate data structure — it's the `Room` when `status === "result"`.

### Visibility Rules (change)

| Condition | Who sees `secretWord` |
|-----------|----------------------|
| `status === "drawing"` | Only the drawer (existing behavior — unchanged) |
| `status === "result"` | ALL players (NEW — secret word revealed to everyone) |

### Display Data (computed from Room state)

| Piece of Data | Source |
|--------------|--------|
| Secret word | `room.secretWord` (now visible to all in result state) |
| Round scores | `room.roundScores[]` (each has participantId + points) |
| Cumulative scores | `room.participants[].score` |
| Correct guessers | Filter `room.currentRoundGuesses` where `isCorrect === true`, deduplicated by `participantId` |
| Guess history | `room.currentRoundGuesses[]` (with `isCorrect` flag for highlighting) |

## Entity: Restart Action (operation contract)

Restart is a host-only operation gated by:

1. Room must exist (404 if not found)
2. Room status must be `"result"` (400 if not)
3. Requester must be the host (403 if not)
4. Returns the full `RoomSnapshot` with `status: "lobby"` and all reset fields
