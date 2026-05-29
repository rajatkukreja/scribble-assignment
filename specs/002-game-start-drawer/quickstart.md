# Quickstart: Game Start & Drawer Flow

## Prerequisites

- Node.js 18+ and npm 9+
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:5173`
- Two browser tabs for multiplayer testing
- The Room Setup & Lobby feature is already implemented

## Running the Apps

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

## Manual Testing Flow

### 1. Verify Name Validation

1. Open `http://localhost:5173` in Tab A
2. Click "Create Room"
3. Enter `"  Alice  "` (with surrounding spaces) and click Create
4. **Verify**: Name is stored as `"Alice"` (trimmed) and lobby shows "Alice"
5. Go back to the start screen and try creating with an empty name
6. **Verify**: Error message is shown — action is prevented
7. Try creating with `"   "` (whitespace only)
8. **Verify**: Error message is shown — action is prevented

### 2. Start Game with Drawer Assignment

1. Tab A (host): Create room as "Alice"
2. Tab B (guest): Join room as "Bob"
3. Tab A has 2 players. Host clicks "Start Game"
4. **Verify (Tab A)**: Transitions to game screen. Shows who the drawer is
5. **Verify (Tab B)**: Transitions to game screen. Shows who the drawer is
6. One of the two players is the drawer (e.g., "Bob")

### 3. Verify Drawer-Only Word Visibility

1. After game starts, Tab A is the drawer, Tab B is the guesser (or vice versa)
2. **Verify (drawer tab)**: The secret word is displayed prominently
3. **Verify (guesser tab)**: The secret word is NOT displayed. Shows "waiting for drawer" or equivalent
4. Open browser DevTools on the guesser tab, inspect network responses
5. **Verify**: The `GET /rooms/:code` response for the guesser does NOT contain `secretWord`

### 4. Verify Drawer Rotation

1. Complete a round (correct guess or timeout)
2. Next round starts with a different drawer
3. **Verify**: The previous round's drawer is NOT the drawer again
4. **Verify**: Over enough rounds, all players have been drawer approximately equally

### 5. Verify Host-Only Start

1. Tab B (non-host) should not see a "Start Game" button
2. If Tab B calls POST /rooms/:code/start via DevTools
3. **Verify**: Returns 403 "Only the host can start the game"

### 6. Verify Minimum Players

1. Create room as host (only 1 player)
2. **Verify**: Start button is disabled or clicking shows "At least 2 players are required"

### 7. Verify Name Validation Edge Cases

1. Join room with a name that is whitespace only: `"   "`
2. **Verify**: Error shown, not allowed to join
3. Join with a name like `" Bob "` (spaces around)
4. **Verify**: Name is stored as "Bob"

## Test Commands

```bash
cd backend
npm test

cd frontend
npm test
```
