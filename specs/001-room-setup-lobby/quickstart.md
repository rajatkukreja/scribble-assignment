# Quickstart: Room Setup & Lobby

## Prerequisites

- Node.js 18+ and npm 9+
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:5173`
- Two browser tabs for multiplayer testing

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

### 1. Create Room (Host)

1. Open `http://localhost:5173` in Tab A
2. Click "Create Room"
3. Enter a display name (e.g., "Alice")
4. Click Create
5. **Verify**: You land on the Lobby page with the room code displayed and a
   "Host" badge next to your name

### 2. Join Room

1. Open `http://localhost:5173` in Tab B
2. Click "Join Room"
3. Enter the room code from Tab A
4. Enter a display name (e.g., "Bob")
5. Click Join
6. **Verify**: You land on the Lobby page. The participant list shows both
   players. You do NOT see a "Start" button.

### 3. Verify Lobby Polling

1. With both tabs on the Lobby page
2. **Verify**: Tab A shows both "Alice" and "Bob" in the participant list
   within ~3 seconds of Bob joining
3. **Verify**: Tab B shows both players within ~3 seconds

### 4. Verify Start Restrictions

1. In Tab B (non-host), confirm there is no start button or it is disabled
2. In Tab A (host), try clicking start — should succeed since 2 players present
3. Close Tab B. In Tab A with only 1 player, click start
4. **Verify**: Error message "At least 2 players are required to start" appears

### 5. Verify Join Validation

1. From the start page, try joining with an empty code
2. **Verify**: Error message "Room code is required"
3. Try joining with a non-existent code (e.g., "ZZZZ")
4. **Verify**: Error message "Room not found"

### 6. Verify Room Isolation

1. Create room in Tab A (code: X7K2)
2. Create room in Tab B (code: PQRS)
3. **Verify**: Tab A's lobby only shows participants from X7K2
4. **Verify**: Tab B's lobby only shows participants from PQRS

## Test Commands

```bash
cd backend
npm test

cd frontend
npm test
```
