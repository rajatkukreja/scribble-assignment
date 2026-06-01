# Quickstart: Gameplay Interaction

## Prerequisites

- Node.js 18+ (see `.nvmrc`)
- Dependencies installed: `npm install` in both `backend/` and `frontend/`

## Development

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend dev server
cd frontend && npm run dev
```

Backend runs on `http://localhost:3001`, frontend on `http://localhost:5173`.

## Testing

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test
```

## Feature-specific notes

- Open two browser tabs to `http://localhost:5173` for multiplayer testing
- Canvas drawing is drawer-only; verify guesser cannot draw
- Guess history and canvas state sync via 2s HTTP polling (no refresh needed)
- Round scoring is calculated at round end (all correct / timer / host skip)
- Clear canvas shows a confirmation dialog before clearing
