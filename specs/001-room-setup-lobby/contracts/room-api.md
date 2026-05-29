# Room API Contracts

## POST /rooms

Create a new room.

**Request Body:**
```json
{
  "playerName": "Alice"
}
```

**Response 201:**
```json
{
  "participantId": "uuid-here",
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-here",
    "participants": [
      { "id": "uuid-here", "name": "Alice", "joinedAt": "2026-05-29T12:00:00.000Z" }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

---

## POST /rooms/:code/join

Join an existing room.

**Request Body:**
```json
{
  "playerName": "Bob"
}
```

**Response 200:**
```json
{
  "participantId": "uuid-bob",
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-alice",
    "participants": [
      { "id": "uuid-alice", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-bob", "name": "Bob", "joinedAt": "..." }
    ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Error Response 400** (empty code):
```json
{
  "error": "Room code is required"
}
```

**Error Response 404** (room not found):
```json
{
  "error": "Room not found"
}
```

---

## GET /rooms/:code?participantId=xxx

Get current room snapshot (used for lobby polling).

**Response 200:**
```json
{
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-alice",
    "participants": [ "...same as above..." ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Error Response 404:**
```json
{
  "error": "Room not found"
}
```

---

## POST /rooms/:code/start

Start the game (host only, requires >= 2 participants).

**Request Body:**
```json
{
  "participantId": "uuid-alice"
}
```

**Response 200:**
```json
{
  "room": {
    "code": "X7K2",
    "status": "lobby",
    "hostId": "uuid-alice",
    "participants": [ "...full participant list..." ],
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

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
