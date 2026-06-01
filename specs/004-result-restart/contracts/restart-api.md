# API Contract: Restart Game

## POST /rooms/:code/restart

Restarts a completed game back to lobby, preserving players but clearing all round state.

### Request

```http
POST /rooms/:code/restart
Content-Type: application/json

{
  "participantId": "uuid-string"
}
```

**Path Parameters**:
| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | 4-character room code (case-insensitive, uppercase stored) |

**Body** (`restartSchema` — Zod validated):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participantId` | `string` | Yes | UUID of the requesting player |

### Success Response (200)

```json
{
  "room": {
    "code": "A3X9",
    "status": "lobby",
    "hostId": "uuid-string",
    "participants": [
      {
        "id": "uuid-string",
        "name": "Alice",
        "score": 0,
        "joinedAt": "2026-06-01T12:00:00.000Z"
      }
    ],
    "currentRound": 0,
    "drawerId": null,
    "secretWord": null,
    "availableWords": ["...", "..."],
    "roles": ["drawer", "guesser"],
    "currentRoundGuesses": [],
    "canvasStrokes": [],
    "roundScores": null
  }
}
```

### Error Responses

| Status | Condition | Error Message |
|--------|-----------|---------------|
| `400` | Room code missing | `"Room code is required"` |
| `404` | Room not found | `"Room not found"` |
| `400` | Room not in result state | `"Game is not in result state"` |
| `403` | Non-host attempts restart | `"Only the host can restart the game"` |
| `400` | Participant ID missing/empty | `"Participant ID is required"` |

### Implementation Notes

- The response uses `toRoomSnapshot(room, participantId)` for consistency with other endpoints.
- Since the room status transitions to `"lobby"` and there is no active drawer, `secretWord` will be `null` and `drawerId` will be `null` for all viewers.
- The `roundScores` field in the snapshot is `null` (not an empty array) when no round scores exist, matching the existing `toRoomSnapshot` behavior.
