# Feature Specification: Game Result & Restart

**Feature Branch**: `004-result-restart`
**Created**: 2026-06-01
**Status**: Draft
**Input**: User description: "Build Result, restart, and final validation. It should have 1. Shared result state visible to all players 2. Clean restart to lobby with players preserved and round state cleared"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Viewing Round Results (Priority: P1)

When a round ends (all guessers correct or host ends round), all players see a shared result screen. The secret word is revealed to everyone. The screen shows each player's score for the round, who guessed correctly and in what order, and the cumulative total scores. Players can review the round outcome and prepare for the next step.

**Why this priority**: The result screen is the moment of payoff — players learn the answer, see how they performed, and get closure on the round. Without it, the game lacks feedback and players cannot assess their progress.

**Independent Test**: A round ends naturally (all guessers correct). All players in the room see the secret word, the round scores, and which players guessed correctly. The display is consistent across all clients.

**Acceptance Scenarios**:

1. **Given** a round has ended (status is "result"), **When** any player views the result screen, **Then** the secret word is visible to all players (not just the drawer).
2. **Given** a round has ended, **When** any player views the result screen, **Then** they see each player's name, their points earned this round, and their cumulative total score.
3. **Given** a round has ended with correct guesses, **When** any player views the result screen, **Then** the correctly-guessing players are visually distinguished from those who did not guess correctly.
4. **Given** a round has ended, **When** any player views the result screen, **Then** the guess history from the round is still visible, with correct guesses highlighted.
5. **Given** a new player joins during the result phase, **When** they view the result screen, **Then** they see the same result information as all other players.

---

### User Story 2 - Restarting to Lobby (Priority: P1)

The host can restart the entire game from the result screen. This returns all players to the lobby, preserving player names and room membership, but clearing all round-related state (scores, round count, draw counts, canvas, guesses). Players can then start a fresh game with the same group without re-creating or re-joining the room.

**Why this priority**: Groups often want to play multiple full games in one session. Without a restart option, players would need to leave and re-create the room, which is friction. Restart preserves the social group while resetting competition.

**Independent Test**: A game with 3 players completes several rounds. The host clicks "Restart to Lobby". All 3 players see the lobby screen with their names preserved. Scores are reset to zero. The host can start a new game from this lobby.

**Acceptance Scenarios**:

1. **Given** the game is in "result" state and the current player is the host, **When** they click "Restart to Lobby", **Then** the room status changes to "lobby" and all players are redirected to the lobby page.
2. **Given** a restart has occurred, **When** any player views the lobby, **Then** all player names from the previous game are still present in the participants list.
3. **Given** a restart has occurred, **When** any player views the lobby, **Then** all displayed scores are zero, the round count is zero, and no game state (canvas, guesses, draw counts) remains from the previous game.
4. **Given** a restart has occurred and the host starts a new game, **When** the first round begins, **Then** it functions as a completely fresh game (new drawer rotation, new word selection, new scoring).
5. **Given** the game is in "result" state and the current player is NOT the host, **When** they look for a restart option, **Then** no "Restart to Lobby" button is available.

---

### User Story 3 - Final Validation of Round Outcome (Priority: P2)

Before the result state becomes actionable (restart or next round), the system ensures that all players can see and acknowledge the round outcome. The secret word, scores, and correct guesses are prominently shown, giving players time to react and discuss before the host decides the next action.

**Why this priority**: The result screen is a social moment — players want to see the answer, react to who guessed correctly, and discuss before moving on. A clear validation phase ensures everyone has the same information before deciding.

**Independent Test**: After a round ends, players see the result screen with the secret word and scores prominently displayed. The host can choose between "Next Round" and "Restart to Lobby" without any required confirmation or timer.

**Acceptance Scenarios**:

1. **Given** a round has just ended, **When** the result screen appears, **Then** the secret word and round scores are the most prominent elements on the screen.
2. **Given** the result screen is displayed, **When** the host clicks "Next Round", **Then** a new drawing round begins.
3. **Given** the result screen is displayed, **When** the host clicks "Restart to Lobby", **Then** all players return to the lobby with round state cleared.
4. **Given** the result screen is displayed, **When** a non-host player views the screen, **Then** they see both the "Next Round" and "Restart" actions as unavailable.

---

### Edge Cases

- What happens when a player disconnects during the result phase and reconnects — do they still see the round results?
- What happens if a player leaves the room during result and the remaining player count drops below 2 — can the host still start a new game after restart?
- What happens when the host restarts to lobby and then disconnects — does the lobby survive with the remaining players?
- What happens when the host clicks "Restart to Lobby" while some players are mid-poll — do those players see an inconsistent state?
- What happens if a player joins a room that is in "result" state — do they see the result screen or the lobby?
- What happens when cumulative scores overflow from many rounds played in a session?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a round ends and the room status is "result", the secret word MUST be revealed to ALL players in the room.
- **FR-002**: The result screen MUST display the secret word prominently.
- **FR-003**: The result screen MUST display each player's round points and cumulative total score.
- **FR-004**: The result screen MUST visually distinguish players who guessed correctly from those who did not.
- **FR-005**: The guess history from the just-completed round MUST remain visible during the result phase, with correct guesses highlighted.
- **FR-006**: The system MUST provide a "Restart to Lobby" action available only to the host and only when the room status is "result".
- **FR-007**: When "Restart to Lobby" is triggered, the system MUST:
  - Set room status to "lobby"
  - Reset all participant scores to 0
  - Reset current round counter to 0
  - Clear all draw counts
  - Clear the drawer ID
  - Clear the secret word
  - Clear current round guesses
  - Clear canvas strokes
  - Clear round scores
  - Preserve all participants in the room
  - Preserve the host ID
- **FR-008**: When "Restart to Lobby" is triggered, all connected players MUST see the lobby screen on their next poll.
- **FR-009**: Non-host players MUST NOT have access to the "Restart to Lobby" action.
- **FR-010**: The "Next Round" action MUST continue to work alongside the new "Restart to Lobby" action during the result phase.
- **FR-011**: Canvas strokes MUST NOT be preserved when transitioning to "result" status.
- **FR-012**: After a restart, starting a new game MUST follow the same process as an initial game start (minimum 2 players, host-only, round-robin drawer rotation starting fresh).
- **FR-013**: All result state MUST be served from the server as the single source of truth.

### Key Entities

- **Result State**: The shared game state when status is "result". Contains the secret word (revealed to all), round scores, cumulative scores, and the guess history from the completed round. Identical for all players.
- **Round Score**: Points earned by a single player in one round. Calculated by the scoring formula at round end. Displayed alongside cumulative total during result phase.
- **Cumulative Score**: The running total of all round scores for a player across the entire game session. Reset to zero on restart.
- **Restart Action**: A host-only operation that resets all game state to initial values while preserving room membership and the host assignment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All players see the secret word and round scores within 2 seconds of the round ending. Verifiable by triggering round end and measuring when all clients display the result information.
- **SC-002**: A host can restart the game to lobby with a single click. Verifiable by observing the "Restart to Lobby" button and counting the actions required to trigger it.
- **SC-003**: After restarting, all players appear in the lobby with their original names, and all scores display as zero. Verifiable by checking the lobby player list and score values on all clients.
- **SC-004**: After restarting, a new game can be started with the same players. Verifiable by clicking "Start Game" from the lobby and observing the first round begin with the same participant list.
- **SC-005**: During the result phase, both "Next Round" and "Restart to Lobby" actions are available to the host. Verifiable by checking that both buttons are visible and functional when the room status is "result".
- **SC-006**: A non-host player cannot trigger a restart. Verifiable by checking that the restart action is not available to non-host players.

## Assumptions

- The "Next Round" behavior (transitioning from "result" back to "drawing") already exists and is not modified by this feature.
- The result screen is the final phase of each round — there is no separate "score review" phase before or after it.
- The "Restart to Lobby" action is only available during the "result" state. It is not available during "drawing" or "lobby" states.
- Canvas strokes are cleared at round end so the result screen shows only textual results.
- The restart preserves the host — the same player who was host before restart remains the host after restart.
- Players who disconnect and reconnect during the result phase see the same result state as all other players.
- Restarting does not affect the room code — the same join code remains valid after restart.
- The guess history during the result phase is read-only since the round is over.
