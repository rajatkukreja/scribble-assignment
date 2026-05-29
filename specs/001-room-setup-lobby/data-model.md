# Data Model: Room Setup & Lobby

**Phase**: 1 — Design
**Date**: 2026-05-29

## Entities

### Room

Represents a single game session.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `code` | `string` | Unique 4-char alphanumeric identifier | Auto-generated, no duplicates |
| `status` | `"lobby"` | Current room state | Must be `"lobby"` (game start transitions to `"drawing"` in later feature) |
| `hostId` | `string` | Participant ID of the room creator | Set on creation, never changes |
| `participants` | `Participant[]` | Players currently in the room | At least 1 (creator) |
| `createdAt` | `string` (ISO 8601) | When the room was created | Server-set |
| `updatedAt` | `string` (ISO 8601) | When the room was last modified | Server-set on every mutation |

### Participant

A player in a room.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `string` (UUID) | Unique participant identifier | Auto-generated |
| `name` | `string` | Display name | Trimmed; must be non-empty after trim |
| `joinedAt` | `string` (ISO 8601) | When the participant joined | Server-set |

### RoomSnapshot

Public view of a room sent to clients.

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Room code |
| `status` | `"lobby"` | Current status |
| `hostId` | `string` | Host participant ID (new) |
| `participants` | `Participant[]` | All participants |
| `availableWords` | `string[]` | Seed word list |
| `roles` | `ParticipantRole[]` | Available roles |

### New Error Response

| Field | Type | Description |
|-------|------|-------------|
| `error` | `string` | Human-readable error message |

## State Transitions

```
[Create Room] --> lobby
[Join Room]   --> lobby (same room)
[Start Game]  --> lobby (only if >= 2 players, only by host)
                --> future: transitions to "drawing"
```

## Validation Rules

- Room codes: auto-generated, 4 chars, uppercase, unique
- Player names: trimmed before use; empty/whitespace-only MUST be rejected
- Join code: MUST be non-empty; non-existent code returns 404
- Start: MUST have `hostId` match requestor; MUST have >= 2 participants
- Room isolation: operations on one room MUST NOT affect any other room's data
