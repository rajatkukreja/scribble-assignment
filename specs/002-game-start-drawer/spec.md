# Feature Specification: Game Start & Drawer Flow

**Feature Branch**: `002-game-start-drawer`
**Created**: 2026-05-29
**Status**: Draft
**Input**: User description: "Build game start and drawer flow. It should have: 1. Player name validation (trim, reject empty) 2. Drawer assignment 3. Deterministic secret word selection 4. Drawer-only word visibility"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Name Validation (Priority: P1)

A player enters or updates their display name when creating or joining a room.
Leading and trailing whitespace is stripped, and empty or whitespace-only names
are rejected with a clear message. This applies at both room creation and join
time.

**Why this priority**: Name validation is a basic data quality gate that affects
every player interaction. Without trimming and empty rejection, players could
proceed with blank or confusing names, causing a poor experience for all
participants.

**Independent Test**: Enter a name with leading/trailing spaces, confirm it is
trimmed on submission. Submit an empty or whitespace-only name and confirm a
clear error is shown and the player is not allowed to proceed.

**Acceptance Scenarios**:

1. **Given** a player is on the create-room screen, **When** they enter "  Alice  "
   (with surrounding spaces) and submit, **Then** their display name is stored
   as "Alice".
2. **Given** a player is on the join-room screen, **When** they enter "  Bob  "
   (with surrounding spaces) and submit, **Then** their display name is stored
   as "Bob".
3. **Given** a player is on the create-room or join-room screen, **When** they
   submit with an empty name field (or whitespace only), **Then** a clear error
   message is shown and the action is prevented.
4. **Given** a player is already in a room, **When** they attempt to change
   their display name to an empty or whitespace-only value, **Then** the change
   is rejected with a clear error message.

---

### User Story 2 - Game Start with Drawer Assignment (Priority: P1)

When the host starts the game (with at least 2 players in the room), a drawer
is assigned and a secret word is selected. All players transition from the
lobby to the game screen. The drawer is informed of their role.

**Why this priority**: Drawer assignment and word selection are the core
mechanics that transition players from waiting in the lobby to active gameplay.
Without this, no game can proceed.

**Independent Test**: Create a room, have a second player join, and as the host
start the game. Confirm all players see the game screen and one player is
designated as the drawer.

**Acceptance Scenarios**:

1. **Given** a host is in the lobby with at least 2 players, **When** the host
   clicks start, **Then** all players transition to the game screen and one
   player is assigned as the drawer.
2. **Given** a non-host player is in the lobby, **When** the game starts,
   **Then** they see who the drawer is (the drawer's name is indicated).
3. **Given** the game starts with exactly 2 players, **When** the drawer is
   assigned, **Then** exactly one player is the drawer and the other is the
   guesser.
4. **Given** the game starts, **When** the drawer is assigned, **Then** the
   same player is never the drawer for two consecutive rounds in a single
   game session.

---

### User Story 3 - Drawer-Only Word Visibility (Priority: P1)

After the game starts, a secret word is selected from a predefined pool. Only
the drawer sees the word. All other players see a "waiting for drawer" state
or equivalent indicator — they cannot see the word, guess the word text, or
otherwise deduce it from the UI.

**Why this priority**: Secret word visibility is the fundamental fairness
mechanism. If non-drawers could see the word, the guessing element of the
game would be broken, making the game unplayable.

**Independent Test**: Start a game in two browser tabs (one drawer, one
guesser). Confirm the drawer sees a word displayed on their screen. Confirm
the guesser does not see the word or any text that reveals it.

**Acceptance Scenarios**:

1. **Given** the game has started and a drawer has been assigned, **When** the
   drawer views the game screen, **Then** they see the secret word displayed
   prominently.
2. **Given** the game has started and a drawer has been assigned, **When** a
   non-drawer views the game screen, **Then** they do **not** see the secret
   word — they see an indicator that the drawer is drawing.
3. **Given** a non-drawer player inspects the page source or network
   responses, **Then** the secret word is not exposed in any client-facing
   data sent to non-drawer players.
4. **Given** a round ends (either by correct guess or timeout), **When** the
   round result is shown, **Then** the secret word is revealed to all players.

---

### Edge Cases

- What happens when the host tries to start the game with fewer than 2 players?
- What happens if a player disconnects during the transition from lobby to game
  screen?
- What happens if the drawer disconnects mid-round? Is a new drawer assigned?
- What happens when the word pool is exhausted after many rounds?
- Does the same word ever repeat across different rooms or rounds?
- What happens if all players have been the drawer the same number of times and
  the pool is exhausted?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST trim leading and trailing whitespace from display
  names on submission (both room creation and room join).
- **FR-002**: The system MUST reject display names that, after trimming, are
  empty or contain only whitespace. A clear, user-facing error message MUST be
  displayed.
- **FR-003**: The system MUST assign exactly one drawer per round when the game
  starts. The drawer MUST be selected from the room's participant list.
- **FR-004**: The system MUST select a drawer such that no player is the drawer
  for two consecutive rounds within the same game session.
- **FR-005**: The system MUST maintain a predefined pool of secret words and
  MUST select one word per round deterministically based on room state (e.g.,
  room code and round number) so that the same room and round always yields the
  same word.
- **FR-006**: The secret word for the current round MUST be sent only to the
  drawer's client. Non-drawer clients MUST NOT receive the word text in any API
  response, page source, or client-side data.
- **FR-007**: Non-drawer players MUST see a clear indicator that the drawer is
  drawing, without any visual or textual hints about the word content (length,
  category, characters, etc.).
- **FR-008**: After a round ends (correct guess, timeout, or host-skip), the
  secret word MUST be revealed to all players in the room.

### Key Entities

- **Drawer**: The player selected to draw the secret word in a given round. One
  drawer per round. Rotates each round.
- **Guesser**: A player who is not the drawer in the current round. Guesses the
  word based on the drawing.
- **Secret Word**: The word selected for the current round. Visible only to the
  drawer during the round. Chosen deterministically from a predefined word pool.
- **Word Pool**: A predefined collection of words from which the secret word is
  selected. Shared across all rooms but does not repeat within a single game
  session until the pool is exhausted.
- **Round**: A single turn in the game where one player draws and others guess.
  The game consists of multiple rounds, each with a new drawer and secret word.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any display name submitted with leading or trailing whitespace is
  stored and displayed trimmed within 1 second of submission.
- **SC-002**: Empty or whitespace-only display name submissions are rejected
  with a clear error message. The player remains on the current screen and is
  not allowed to proceed. Verifiable by attempting to submit an empty name.
- **SC-003**: When the host starts a game with 2+ players, all players
  transition to the game screen and see the correct drawer designation within
  3 seconds.
- **SC-004**: The drawer sees the secret word on their screen. Non-drawers do
  not see the word or any information that could reveal it (length, letters,
  category). Verifiable by inspecting the non-drawer's UI and network responses.
- **SC-005**: The same word is selected for the same room and round number
  every time (deterministic). Verifiable by starting the same room twice and
  confirming the word matches for identical round numbers.
- **SC-006**: The same player is never the drawer in two consecutive rounds.
  Verifiable by observing multiple round transitions in a test session.

## Assumptions

- Display name validation (trimming and empty rejection) applies at room
  creation and room join time only. In-game name changes are out of scope.
- The drawer is selected randomly at game start. Subsequent rounds rotate the
  drawer to a player who has drawn the fewest times (or the longest ago).
- The word pool contains at least 50 unique words suitable for a drawing game.
  Words are single words (not phrases), between 3-10 characters, and common
  enough to be recognizable.
- "Deterministic" means the word for a given (room code, round number) pair is
  always the same. This is achieved by using the room code and round number as
  a seed into the word pool.
- The game operates in rounds. A round ends when the word is guessed correctly,
  a timer expires, or the host skips the round.
- Host departure during gameplay (including drawer disconnection) is out of
  scope for this feature and will be handled separately.
- All players have a stable internet connection. Brief disconnections may cause
  missed states but will resolve on next poll cycle.
