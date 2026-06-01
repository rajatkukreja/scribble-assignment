# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`
**Created**: 2026-06-01
**Status**: Draft
**Input**: User description: "Build gameplay interaction. It should have 1. Interactive drawing canvas 2. Clear canvas 3. Guess submission with validation 4. Synced guess history via polling 5. Deterministic scoring"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drawing on the Canvas (Priority: P1)

The drawer uses an interactive canvas to draw the secret word for other players. They can select a color, choose a brush width, draw free-form lines, and clear the entire canvas to start over.

**Why this priority**: The drawing canvas is the primary way the drawer communicates the secret word to guessers. Without it, the game has no core interaction mechanism.

**Independent Test**: A player assigned as drawer can draw lines on the canvas, switch colors, change brush width, and clear the canvas entirely. A non-drawer player cannot interact with the canvas.

**Acceptance Scenarios**:

1. **Given** the round has started and the player is the drawer, **When** they click/drag on the canvas, **Then** a colored line appears following the cursor path.
2. **Given** the drawer is actively drawing, **When** they select a different color from the palette, **Then** subsequent strokes use the new color.
3. **Given** the drawer is actively drawing, **When** they select a different brush width, **Then** subsequent strokes use the new width.
4. **Given** the drawer has drawn content on the canvas, **When** they click "Clear Canvas", **Then** all drawn content is removed and the canvas returns to a blank white state.
5. **Given** the round has started and the player is a guesser, **When** they attempt to draw on the canvas, **Then** nothing happens — the canvas is view-only for guessers.

---

### User Story 2 - Submitting Guesses (Priority: P1)

A guesser types a guess about what the drawing represents and submits it. The system validates the guess (non-empty, not a repeat of their own previous guess) and returns whether it was correct. The drawer cannot submit guesses.

**Why this priority**: Guess submission is the core interaction for all non-drawer players. Without it, the game cannot progress toward a round end or scoring.

**Independent Test**: A guesser submits a guess and sees it appear in the guess history. The same guesser cannot submit the same guess twice. The drawer cannot submit guesses.

**Acceptance Scenarios**:

1. **Given** a guesser is viewing the game screen, **When** they type a word and submit it, **Then** the guess appears in the guess history and they receive feedback on whether it was correct.
2. **Given** a guesser has already submitted a guess, **When** they type the exact same text again and submit, **Then** the submission is rejected with a "duplicate guess" message.
3. **Given** a guesser submits an empty or whitespace-only guess, **When** they click submit, **Then** the submission is rejected and they are prompted to enter a valid guess.
4. **Given** a guesser submits a guess exceeding 100 characters, **When** they click submit, **Then** the submission is rejected with a length limit message.
5. **Given** the current player is the drawer, **When** they attempt to submit a guess, **Then** the guess input is disabled or hidden — the drawer cannot submit guesses.

---

### User Story 3 - Seeing Live Guess History (Priority: P2)

All players in the room see a running list of guesses submitted during the current round. The list updates automatically so players can see what others have guessed and avoid repeating wrong answers.

**Why this priority**: Shared guess history is essential for collaborative gameplay — it prevents players from wasting guesses on already-rejected words and creates engagement as players watch others' progress.

**Independent Test**: Two guessers submit guesses in one round. Each player sees both guesses appear in the guess history within 3 seconds of submission.

**Acceptance Scenarios**:

1. **Given** a guesser submits a guess, **When** the submission is accepted, **Then** the guess appears in the guess history for all players in the room within 3 seconds.
2. **Given** the guess history contains guesses, **When** a new player joins mid-round, **Then** they see the full guess history for the current round.
3. **Given** the guess history list, **When** a new round starts, **Then** the guess history is cleared and starts fresh for the new round.
4. **Given** a player submits a correct guess, **When** the guess history updates, **Then** the correct guess is visually distinguished (e.g., highlighted or annotated) to indicate it was correct.

---

### User Story 4 - Scoring at Round End (Priority: P2)

When the round ends (correct guess, timer expiry, or skip), points are calculated deterministically based on guess order and outcome. All players see their scores for the round and the running total.

**Why this priority**: Scoring provides motivation, competition, and a sense of progress. Deterministic scoring ensures fairness — the same actions always produce the same point values.

**Independent Test**: Complete a round where two players guess correctly. Confirm the first correct guesser receives more points than the second. Confirm the drawer receives points for each correct guesser. Repeat the exact same scenario and confirm scores match.

**Acceptance Scenarios**:

1. **Given** a round ends with multiple correct guesses, **When** scores are calculated, **Then** the first correct guesser receives the highest points, and each subsequent correct guesser receives progressively fewer points.
2. **Given** a round ends, **When** scores are calculated, **Then** the drawer receives points for each player who guessed correctly (excluding the drawer).
3. **Given** a round ends with zero correct guesses, **When** scores are calculated, **Then** no player receives points for that round (including the drawer).
4. **Given** two identical rounds (same players, same word, same guess order and outcomes), **When** scores are calculated for each, **Then** the scores are identical (deterministic).
5. **Given** a round ends, **When** the scoreboard is displayed, **Then** both the current round's points and the cumulative total for each player are shown.

---

### Edge Cases

- What happens when a guesser disconnects mid-round and reconnects — do their previous guesses show in history?
- What happens when a player attempts to submit a guess that exactly matches the secret word but with different casing?
- What happens when all guessers have guessed correctly — does the round end immediately?
- What happens if the drawer clears the canvas immediately after drawing — do guessers see the cleared canvas in real-time?
- What happens when the canvas is cleared accidentally — is there an undo option?
- What happens if the timer expires while a guess submission is in flight?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an interactive canvas that the drawer can draw on using mouse or touch input.
- **FR-002**: The drawer MUST be able to select from a palette of at least 8 colors before drawing.
- **FR-003**: The drawer MUST be able to select from at least 3 brush widths (thin, medium, thick) before drawing.
- **FR-004**: The drawer MUST be able to clear all drawn content from the canvas with a single action.
- **FR-005**: Clearing the canvas MUST require a confirmation step to prevent accidental clearing.
- **FR-006**: Non-drawer players MUST NOT be able to draw on the canvas or clear it — the canvas is view-only for guessers.
- **FR-007**: The system MUST trim leading and trailing whitespace from guess submissions.
- **FR-008**: The system MUST reject guess submissions that, after trimming, are empty or contain only whitespace.
- **FR-009**: The system MUST reject guess submissions that exceed 100 characters after trimming.
- **FR-010**: The system MUST reject guess submissions that exactly duplicate the submitting player's own previous guess in the current round (case-insensitive).
- **FR-011**: The drawer MUST NOT be able to submit guesses during their own drawing round.
- **FR-012**: When a guess submission is accepted, the system MUST determine whether it matches the secret word (case-insensitive, exact match).
- **FR-013**: When a guess matches the secret word, the guesser MUST be notified that their guess was correct.
- **FR-014**: The system MUST present a live guess history to all players in the room, updated within 3 seconds of any new guess submission.
- **FR-015**: The guess history MUST include: the guess text, the guesser's display name, whether the guess was correct, and a relative or absolute timestamp.
- **FR-016**: The guess history MUST persist across client refreshes for the duration of the round (via server-side state).
- **FR-017**: When a new round starts, the guess history MUST be reset to empty.
- **FR-018**: When a guess is correct, it MUST be visually distinguished in the guess history from incorrect guesses.
- **FR-019**: The system MUST calculate round scores deterministically — identical inputs always produce identical score outputs.
- **FR-020**: Round scoring MUST use the following formula:
  - The first correct guesser receives 10 points.
  - Each subsequent correct guesser receives 2 fewer points than the previous correct guesser, with a minimum of 3 points (i.e., 1st=10, 2nd=8, 3rd=6, 4th=4, 5th+=3).
  - The drawer receives 5 points for each player who guessed correctly (excluding the drawer).
  - If no player guesses correctly, no player (including the drawer) receives points.
- **FR-021**: At round end, all players MUST see the round scores and the cumulative total score for each player.
- **FR-022**: The system MUST support at least 30 strokes on the canvas without degradation.

### Key Entities

- **Canvas State**: The current visual content of the drawing surface, represented as a collection of strokes. Persisted on the server between polls so reconnect yields the current drawing.
- **Stroke**: A single continuous drawing action consisting of a list of points, stroke color, and stroke width.
- **Guess**: A text submission from a guesser attempting to identify the secret word. Contains the text, the guesser's identity, the timestamp, and whether it was correct.
- **Guess History**: An ordered list of all guesses submitted in the current round, shared across all players in the room.
- **Round Score**: Points earned by a single player in one round, calculated deterministically at round end.
- **Scoreboard**: Running cumulative totals of all players' round scores across the entire game session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A drawer can select a color, draw strokes, change brush width, and clear the canvas within 2 interactions each. Verifiable by timing a drawer performing these actions.
- **SC-002**: A guesser can type a guess and receive submission feedback (accepted or rejected) within 2 seconds. Verifiable by submitting guesses and measuring response time.
- **SC-003**: All players in a room see a new guess appear in the guess history within 3 seconds of submission. Verifiable by submitting a guess and checking the history on another client.
- **SC-004**: The same round scenario (same players, same word, same guess order) always produces identical scores. Verifiable by replaying the exact round and comparing score output.
- **SC-005**: First correct guesser receives more points than the second correct guesser. Verifiable by observing multiple rounds with multiple correct guesses.
- **SC-006**: A player who submits an empty guess, duplicate guess, or guesses as the drawer receives a clear rejection message within 2 seconds.

## Assumptions

- Canvas drawing uses free-form lines (not shape tools like rectangles, circles, or text). Shape tools are out of scope for this feature.
- The color palette provides at least 8 common colors (black, white, red, blue, green, yellow, orange, purple). Custom color picker is out of scope.
- Brush widths are limited to 3 predefined sizes. Custom width slider is out of scope.
- Confirmation for clearing the canvas is a simple dialog (OK/Cancel). Undo functionality is out of scope.
- The guess history refreshes via polling every 2 seconds. The server stores the last 100 guesses per round (adequate for typical game sizes).
- Scoring is based purely on guess order — no time bonus or streak bonus is applied beyond the order-based point degradation.
- Duplicate guess detection is per-player, not global — two different players can submit the same guess text.
- A correct guess does not immediately end the round — the round continues until all guessers have guessed correctly, a timer expires, or the host ends the round.
- The round timer is assumed to exist (defined in a separate feature or defaulting to 60 seconds).
- Canvas state is polled alongside guess history to keep all clients in sync.
