# Data Model: Gameplay Interaction

## Extended Entities

### Guess

Represents a single guess submission during a round.

```
Guess {
  participantId: string      // who guessed
  participantName: string    // denormalized for display
  text: string               // the guess text (trimmed, lowercased for comparison)
  isCorrect: boolean         // whether it matched the secret word
  timestamp: string          // ISO timestamp of submission
}
```

**Validation rules** (from spec FR-007 to FR-011):
- Text must be non-empty after trimming (length ≥ 1)
- Text must not exceed 100 characters after trimming
- Text must not duplicate the submitter's own previous guess in this round (case-insensitive)
- Drawer cannot submit guesses (enforced by route/store)
- Guesses are stored as-is (original casing preserved) but compared case-insensitively

### CanvasStroke

Represents a single continuous drawing action.

```
CanvasStroke {
  points: Array<{ x: number, y: number }>  // at least 2 points
  color: string                              // hex color code, e.g. "#000000"
  width: number                              // brush width in pixels (1, 3, or 6)
}
```

### RoundScore

Points earned by one participant in one round.

```
RoundScore {
  participantId: string
  round: number
  points: number             // points earned this round (can be 0)
  reason: "correct-guess" | "drawer-bonus" | "no-points"
}
```

## Extended Room Model

Fields added to the existing `Room` type:

```
Room {
  // ...existing fields...
  
  // NEW:
  currentRoundGuesses: Guess[]      // guesses for the active round, reset each round
  canvasStrokes: CanvasStroke[]     // current drawing state, reset each round
  correctGuessOrder: number         // counter for scoring: increments per correct guess (starts at 0)
  roundScores: RoundScore[]         // accumulated scores per round for current game session
}
```

### State Transition

```
drawing: {
  // drawer draws → strokes POST to server → server appends to canvasStrokes
  // guesser submits guess → POST /rooms/:code/guess → server appends to currentRoundGuesses
  //    → if correct and not already correct: increment correctGuessOrder, mark isCorrect
  //    → do NOT transition state (no immediate "result")
  // on round end (all correct / timer / host skip):
  //    → call calculateRoundScore()
  //    → store RoundScore[] in roundScores
  //    → update participant scores
  //    → transition to "result"
}
```

## RoomSnapshot Changes

Fields added to the existing `RoomSnapshot`:

```
RoomSnapshot {
  // ...existing fields...
  
  // NEW:
  currentRoundGuesses: Guess[]          // all guesses in current round (visible to all)
  canvasStrokes: CanvasStroke[]         // complete canvas state (visible to all, drawer-only write)
  roundScores: RoundScore[] | null      // null during active round, populated at "result"
}
```

## Score Calculation (Pure Function)

```
function calculateRoundScore(
  participants: Participant[],
  currentRoundGuesses: Guess[],
  drawerId: string
): { participantId: string; points: number }[] {

  // 1. Determine correct guessers in order
  const correctGuessers = currentRoundGuesses
    .filter(g => g.isCorrect)
    .map(g => g.participantId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx) // unique

  // 2. Award points
  return participants.map(p => {
    if (p.id === drawerId) {
      return { participantId: p.id, points: correctGuessers.length * 5 }
    }
    const orderIndex = correctGuessers.indexOf(p.id)
    if (orderIndex === -1) return { participantId: p.id, points: 0 }
    return { participantId: p.id, points: Math.max(3, 10 - orderIndex * 2) }
  })
}
```
