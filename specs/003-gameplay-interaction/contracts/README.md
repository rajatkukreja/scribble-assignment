# API Contracts: Gameplay Interaction

All endpoints extend the existing Express REST API at `http://localhost:3001`.

## Existing Endpoints (Unchanged)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/rooms` | Create room |
| `POST` | `/rooms/:code/join` | Join room |
| `POST` | `/rooms/:code/start` | Start game |
| `GET` | `/rooms/:code` | Fetch room snapshot (extended — see below) |

## Existing Endpoints (Extended)

### `POST /rooms/:code/guess`

Submit a guess for the current round.

**Request Body:**
```json
{
  "participantId": "uuid-string",
  "guess": "apple"
}
```

**Behavior changes from v1:**
- No longer transitions room to `"result"` on correct guess
- Correct guess does not award points immediately (scoring deferred to round end)
- Store guess in `currentRoundGuesses[]` on Room
- Duplicate guess check per-player (case-insensitive)
- Return updated room snapshot with guess history

**Response (200):**
```json
{
  "correct": true,
  "room": {
    "...": "...",
    "currentRoundGuesses": [
      { "participantId": "...", "participantName": "Alice", "text": "apple", "isCorrect": true, "timestamp": "..." }
    ]
  }
}
```

**Error responses:**
- `400`: No round in progress, guess empty/exceeds 100 chars, duplicate guess
- `403`: Drawer cannot guess

---

### `GET /rooms/:code`

Fetch room snapshot. Extended to include:

**Response (200):**
```json
{
  "room": {
    "code": "ABCD",
    "status": "drawing",
    "participants": [...],
    "currentRound": 1,
    "drawerId": "uuid-1",
    "secretWord": null,
    "...": "...",
    "currentRoundGuesses": [...],
    "canvasStrokes": [
      { "points": [{"x": 10, "y": 20}, {"x": 30, "y": 40}], "color": "#000000", "width": 3 }
    ],
    "roundScores": null
  }
}
```

`roundScores` is `null` during active round, populated with `RoundScore[]` when status is `"result"`.

## New Endpoints

### `POST /rooms/:code/canvas/stroke`

Append a single stroke to the canvas state. Drawer-only.

**Request Body:**
```json
{
  "participantId": "uuid-string",
  "stroke": {
    "points": [{"x": 0, "y": 0}, {"x": 100, "y": 200}],
    "color": "#FF0000",
    "width": 3
  }
}
```

**Response (200):**
```json
{
  "ok": true,
  "room": { "...room snapshot with updated canvasStrokes..." }
}
```

**Error responses:**
- `400`: No round in progress
- `403`: Non-drawer attempted to draw
- `400`: Invalid stroke data (no points, bad color format)

---

### `POST /rooms/:code/canvas/clear`

Clear all canvas strokes for the current round. Drawer-only. Requires confirmation token or uses confirmation dialog client-side.

**Request Body:**
```json
{
  "participantId": "uuid-string"
}
```

**Response (200):**
```json
{
  "ok": true,
  "room": { "...room snapshot with empty canvasStrokes..." }
}
```

**Error responses:**
- `400`: No round in progress
- `403`: Non-drawer attempted to clear

---

### `POST /rooms/:code/end-round` (Future / optional)

End the current round manually (host skip). Triggers scoring and transitions to `"result"`.

**Not implemented in this feature** — round end is assumed to be triggered by timer or all-correct condition per spec assumptions.
