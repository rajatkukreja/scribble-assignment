# Quickstart: Game Result & Restart

## Build & Development

```bash
# Backend
cd backend
npm run dev          # Start dev server on :3001

# Frontend (separate terminal)
cd frontend
npm run dev          # Start dev server on :5173
```

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Manual Test Flow (Result State)

1. Create a room with 2+ players (two browser tabs)
2. Host starts the game
3. Play through a round until all guessers guess correctly or host ends round
4. **Verify**: Both tabs show the "result" screen
5. **Verify**: Both tabs see the secret word displayed
6. **Verify**: Both tabs see round scores with correct guessers highlighted
7. **Verify**: Guess history is visible with correct guesses highlighted

## Manual Test Flow (Restart to Lobby)

1. From the result screen, the host clicks "Restart to Lobby"
2. **Verify**: Both tabs show the lobby screen
3. **Verify**: All player names are still present
4. **Verify**: All scores display as 0
5. **Verify**: No game elements (canvas, guesses, etc.) visible
6. Host clicks "Start Game" — **verify** a new game begins with the same players
7. First round starts — **verify** drawer rotation starts fresh (players who drew last game may draw again)

## Validation Checklist

- [ ] Secret word visible to ALL players during result (not just drawer)
- [ ] "Restart to Lobby" button visible only to host during result
- [ ] Non-host cannot see or trigger restart
- [ ] After restart: scores=0, round=0, drawer=null, canvas empty, guesses empty
- [ ] After restart: all players preserved, host preserved, room code preserved
- [ ] "Next Round" still works alongside "Restart to Lobby" for host
- [ ] Cross-client consistency: both tabs show identical result state and lobby state
