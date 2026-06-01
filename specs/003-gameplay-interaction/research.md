# Research: Gameplay Interaction

## Drawing Canvas — React + HTML Canvas 2D

**Decision**: Use HTML `<canvas>` element with Canvas 2D API, wrapped in a React component using `useRef` and `useEffect` for imperative drawing.

**Rationale**: 
- Canvas 2D API is lightweight, well-supported, and requires no additional dependencies
- React's declarative model does not map well to imperative drawing operations, so a ref-based wrapper with imperative event handlers is the standard pattern
- Canvas state can be serialized as an array of strokes (each stroke = array of points + color + width)
- Redraw triggered by polling response: clear canvas element, replay all strokes

**Alternatives considered**:
- SVG: Would require individual DOM nodes per stroke, performance degrades with 30+ strokes
- Third-party libs (Fabric.js, Konva): Unnecessary dependency for a simple freeform drawing app

### Stroke Data Format

```
Stroke {
  points: Array<{x: number, y: number}>  // at least 2 points
  color: string                          // hex color
  width: number                          // brush width in px
}
```

Serialized as JSON for HTTP transport. Server stores as `CanvasStroke[]` on the Room object.

## Canvas Sync via HTTP Polling

**Decision**: Canvas strokes stored server-side as part of Room data. Polled alongside room state on the existing 2s interval. Strokes are accumulated and transmitted as a complete array (not delta patches).

**Rationale**:
- The polling pattern already exists for room state (2s interval in `RoomStore.startPolling`)
- Adding strokes to the same response avoids a second poll loop
- Sending full array is simpler than delta sync and adequate for < 100 strokes per round
- No debouncing on drawer side: each stroke is sent immediately as an HTTP POST

**Alternatives considered**:
- Delta patches: More complex, unnecessary at this stroke volume
- Separate poll endpoint: Adds complexity, no benefit since both need same polling interval

## Guess History Polling

**Decision**: Guess history included in room snapshot, polled on same 2s interval. Server stores `Guess[]` per round on Room.

**Rationale**: Same rationale as canvas sync — reuse existing polling infrastructure. Guesses and canvas state are part of the same room state and should arrive atomically.

## Progressive Scoring Implementation

**Decision**: Pure function `calculateRoundScore(participants, correctGuessOrder, drawerId)` called at round end. Deterministic: same inputs → same outputs.

**Formula** (per spec FR-020):
- Correct guessers: max(3, 10 - 2 × (order - 1)) where order is 1-indexed
  - 1st: 10, 2nd: 8, 3rd: 6, 4th: 4, 5th+: 3
- Drawer: 5 × count of players who guessed correctly (excluding drawer)
- Zero correct: no points to anyone

**Round end conditions** (per spec assumptions):
- All guessers have guessed correctly
- Timer expires (60s default, from separate feature)
- Host skips the round

**Integration**: Existing `submitGuess` currently transitions to `result` immediately on first correct guess. This must change: stay in `drawing` state (no state transition on correct guess), award points only at round end via new `endRound` function.

## Dependency Impact

**No new npm packages required.** Canvas 2D API is built into browsers. All other functionality uses existing Express, React, and TypeScript tooling.
