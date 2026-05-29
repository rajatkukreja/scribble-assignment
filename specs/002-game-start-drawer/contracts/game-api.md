# Game API Contracts

## POST /rooms/:code/start

Start the game (host only, requires >= 2 participants). Transitions room from `lobby` to `drawing`.

**Request Body:**
```json
{
  "participantId": "uuid-alice"
}
```

**Response 200 (success):**
```json
{
  "room": {
    "code": "X7K2",
    "status": "drawing",
    "hostId": "uuid-alice",
    "currentRound": 1,
    "drawerId": "uuid-bob",
    "participants": [
      { "id": "uuid-alice", "name": "Alice", "score": 0, "joinedAt": "..." },
      { "id": "uuid-bob", "name": "Bob", "score": 0, "joinedAt": "..." }
    ],
    "availableWords": ["castle", "guitar", "pizza", "rocket", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Notes:**
- The `secretWord` is NOT included in the start response (to prevent accidental
  exposure). The drawer retrieves it via the polling endpoint.
- The `drawerId` tells all clients who the drawer is for this round.

**Error Response 403** (non-host tries to start):
```json
{
  "error": "Only the host can start the game"
}
```

**Error Response 400** (not enough players):
```json
{
  "error": "At least 2 players are required to start"
}
```

---

## GET /rooms/:code?participantId=xxx

Get current room snapshot (used for polling). Extended to include game state when room is in `drawing` or `result` status.

**Response 200 — drawer's view (participantId === drawerId):**
```json
{
  "room": {
    "code": "X7K2",
    "status": "drawing",
    "hostId": "uuid-alice",
    "currentRound": 1,
    "drawerId": "uuid-bob",
    "secretWord": "pizza",
    "participants": [
      { "id": "uuid-alice", "name": "Alice", "score": 0 },
      { "id": "uuid-bob", "name": "Bob", "score": 0 }
    ],
    "availableWords": ["castle", "guitar", "pizza", "rocket", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Response 200 — non-drawer's view (participantId !== drawerId):**
```json
{
  "room": {
    "code": "X7K2",
    "status": "drawing",
    "hostId": "uuid-alice",
    "currentRound": 1,
    "drawerId": "uuid-bob",
    "participants": [
      { "id": "uuid-alice", "name": "Alice", "score": 0 },
      { "id": "uuid-bob", "name": "Bob", "score": 100 }
    ],
    "availableWords": ["castle", "guitar", "pizza", "rocket", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Notes:**
- `secretWord` is present ONLY when the requesting participant is the drawer.
- Non-drawers receive `secretWord: null` or the field is omitted entirely.

---

## POST /rooms/:code/guess

Submit a guess for the current round (non-drawers only).

**Request Body:**
```json
{
  "participantId": "uuid-alice",
  "guess": "pizza"
}
```

**Response 200** (correct guess):
```json
{
  "correct": true,
  "round": {
    "number": 1,
    "status": "result",
    "drawerId": "uuid-bob",
    "secretWord": "pizza"
  },
  "scores": {
    "uuid-alice": 100,
    "uuid-bob": 0
  }
}
```

**Response 200** (incorrect guess):
```json
{
  "correct": false,
  "round": {
    "number": 1,
    "status": "drawing"
  }
}
```

**Error Response 403** (drawer tries to guess):
```json
{
  "error": "The drawer cannot guess"
}
```

**Error Response 400** (empty guess):
```json
{
  "error": "Guess cannot be empty"
}
```

---

## Error Responses (shared)

### 400 — Validation Error
```json
{
  "error": "Descriptive error message"
}
```

### 403 — Forbidden
```json
{
  "error": "Only the host can start the game"
}
```

### 404 — Not Found
```json
{
  "error": "Room not found"
}
```
