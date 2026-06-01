# Research: Game Result & Restart

**Phase 0** — No NEEDS CLARIFICATION items to resolve.

## Technical Context Verification

All technical context was resolved from the existing project structure (no unknowns):

| Field | Value | Source |
|-------|-------|--------|
| Language | TypeScript 5.x (strict) | `backend/tsconfig.json`, `frontend/tsconfig.json` |
| Backend framework | Express 4.x | `backend/package.json` |
| Frontend framework | React 18.x + Vite 6.x | `frontend/package.json` |
| Validation | Zod 3.x | `backend/package.json` |
| Testing | Vitest 3.x | Both `package.json` files |
| Storage | In-memory `Map<string, Room>` | `backend/src/services/roomStore.ts` |
| Architecture | 3-layer backend (api/services/models), functional components frontend | Project convention |
| State transitions | `lobby -> drawing -> result -> lobby` | Constitution + existing code |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| REST endpoint `POST /:code/restart` | Follows existing pattern (`POST /:code/start`, `POST /:code/end-round`) |
| Host-only restart | Matches existing host-gated actions (start, end-round) |
| Server-authoritative reset | All state mutation happens server-side; clients poll to discover new state |
| `toRoomSnapshot` change for result | Secret word revealed to all when `status === "result"` — minimal change, maximum impact |
| Preserved host + participants | Restart is a "new game with same group" — keeping membership avoids re-join friction |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Client-side restart (navigate + reset local state) | Inconsistent across clients; server is the single source of truth |
| "Restart" as part of lobby page | Players must leave game screen to restart; adds extra navigation step |
| Auto-restart (no host action) | Host needs control over game flow; auto-restart could be unexpected |
