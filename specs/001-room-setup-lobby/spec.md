# Feature Specification: Room Setup & Lobby

**Feature Branch**: `001-room-setup-lobby`
**Created**: 2026-05-29
**Status**: Draft
**Input**: User description: "Build Room setup and lobby"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Room with Host Assignment (Priority: P1)

A player opens the app and creates a new game room. They are automatically
designated as the host and can see the room details. The room is assigned a
unique code that others can use to join.

**Why this priority**: Room creation is the entry point for all gameplay. Without
this capability, no other interaction is possible. Host assignment is fundamental
to the room ownership model.

**Independent Test**: Open the app, click "Create Room", enter a display name,
and confirm the room is created and you are shown as the host on the lobby screen.

**Acceptance Scenarios**:

1. **Given** a player is on the start screen, **When** they enter a display name
   and create a room, **Then** a room is created with a unique code and the
   player is designated as the host.
2. **Given** a room has been created, **When** the host views the lobby,
   **Then** they see the room code displayed and are clearly identified as the
   host (e.g., with a label or badge).
3. **Given** a room is created, **When** another player joins, **Then** the
   creator remains the host.

---

### User Story 2 - Join Room with Validation (Priority: P1)

A player joins an existing room by entering its unique code. Invalid, empty, or
non-existent codes are rejected with a clear, user-friendly message.

**Why this priority**: Joining rooms is the second key interaction. Without join
validation, players cannot reliably connect to the correct game. Clear error
messages prevent confusion.

**Independent Test**: Open the app, try joining with an empty code, a
non-existent code, and a valid code. Confirm appropriate feedback for each case.

**Acceptance Scenarios**:

1. **Given** a player is on the start screen, **When** they enter a valid room
   code and a display name, **Then** they successfully join the room and are
   added to the participant list.
2. **Given** a player is on the start screen, **When** they submit an empty room
   code, **Then** a clear error message is shown indicating the code is required.
3. **Given** a player is on the start screen, **When** they submit a room code
   that does not match any existing room, **Then** a clear error message is shown
   indicating the room was not found.
4. **Given** a player is already in a room, **When** they try to join a
   different room, **Then** they successfully leave the current room and join
   the new one.

---

### User Story 3 - Lobby Polling and Game Start (Priority: P2)

After creating or joining a room, all players see the lobby with the participant
list. The list updates automatically to reflect new arrivals. When at least two
players are present, the host can start the game.

**Why this priority**: The lobby is the waiting area before gameplay. Automatic
updates ensure players see accurate participant lists without manual refreshing.
Host-only start ensures only the room owner controls when the game begins.

**Independent Test**: Open two browser tabs. Create a room in tab A, join in
tab B. Confirm tab A shows two participants within about 3 seconds and the host
can start the game. Confirm a non-host player cannot start the game.

**Acceptance Scenarios**:

1. **Given** a host is in the lobby, **When** a new player joins the room,
   **Then** the host's lobby updates to show the new participant within about
   3 seconds.
2. **Given** a non-host player is in the lobby, **When** the host has not
   started the game, **Then** the non-host player sees a "waiting for host"
   state and does not see a start button.
3. **Given** the host is in the lobby with at least 2 players total, **When**
   the host clicks start, **Then** the game begins and all players transition
   to the game screen.
4. **Given** the host is in the lobby with only 1 player (themselves), **When**
   the host clicks start, **Then** a clear message is shown indicating at least
   2 players are needed.
5. **Given** the host is in the lobby with at least 2 players, **When** a
   non-host attempts to start the game, **Then** the action is rejected.

---

### Edge Cases

- What happens when the host closes their browser tab during lobby?
- What happens if a player enters a room code with leading/trailing spaces?
- What happens when two players try to join with the same display name?
- What happens when a room has been active for a long time with no activity?
- What happens when a player who is already in a room tries to join the same
  room again?
- What happens if network connectivity is lost during polling?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST assign host status to the player who creates a
  room. Host status MUST persist for the lifetime of the room.
- **FR-002**: Room codes MUST be unique and auto-generated upon room creation.
  The generated code MUST be displayed to the creator.
- **FR-003**: The system MUST reject join attempts with empty or whitespace-only
  room codes and display a clear error message.
- **FR-004**: The system MUST reject join attempts for non-existent room codes
  with a clear "room not found" error message.
- **FR-005**: Each room MUST be fully isolated. Players in one room MUST NOT see
  data (participants, game state) from any other room.
- **FR-006**: The lobby participant list MUST refresh automatically at
  approximately 2-second intervals while a player is on the lobby screen.
- **FR-007**: Only the host MUST be able to trigger game start. Non-host players
  MUST NOT have a start action available.
- **FR-008**: The system MUST require at least 2 players in the room before
  allowing the host to start the game.
- **FR-009**: If the host attempts to start with fewer than 2 players, the
  system MUST display a clear message indicating the minimum player requirement.
- **FR-010**: The system MUST display the room code prominently on the lobby
  screen so the host can share it with other players.

### Key Entities

- **Room**: A game session identified by a unique code. Contains a list of
  participants, a designated host, and tracks the current game state. Isolated
  from all other rooms.
- **Player**: A participant in a room, identified by a display name. A player is
  associated with exactly one room at a time. The player who created the room is
  the host.
- **Host**: A special role assigned to the room creator. Has exclusive
  permission to start the game. There is exactly one host per room.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a room and is immediately recognized and
  labeled as host. Verifiable by observing the host badge on the lobby screen.
- **SC-002**: Invalid room codes (empty, whitespace, non-existent) produce a
  specific, user-facing error message within 2 seconds of submission.
- **SC-003**: Two separate rooms operate independently. Joining one room does
  not reveal participants or state from the other. Verifiable by creating two
  rooms in separate browser sessions and confirming no cross-room data leakage.
- **SC-004**: When a new player joins a room, all existing players in that
  room's lobby see the updated participant list within 3 seconds.
- **SC-005**: Only the host can trigger game start. A non-host sees no start
  button or receives a rejection. Verifiable by observing the UI on a non-host
  player's screen.
- **SC-006**: The host can start the game only when at least 2 players are in
  the room. Attempting with 1 player shows a clear minimum-player message.

## Assumptions

- Lobby polling cadence of "about 2 seconds" means the UI refreshes at a rate
  that ensures updates appear within 3 seconds under normal network conditions.
- Players use modern browsers with JavaScript enabled. No fallback for
  JavaScript-disabled browsers is required.
- Network latency is assumed to be within typical broadband range (under 500ms
  round-trip). Polling intervals may be affected by unusually high latency.
- A player's display name is provided at room creation or join time. Names are
  not validated beyond being non-empty.
- Host departure handling (what happens when the host leaves mid-game or during
  lobby) is considered out of scope for this feature and will be handled
  separately.
