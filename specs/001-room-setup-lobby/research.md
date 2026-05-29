# Research: Room Setup & Lobby

**Phase**: 0 — Technical Research
**Date**: 2026-05-29

## Overview

This document consolidates research findings for the Room Setup & Lobby feature.
All Technical Context fields were resolvable from existing project knowledge —
no NEEDS CLARIFICATION markers remained.

## Decisions

### Language & Runtime

- **Decision**: TypeScript 5.x with strict mode
- **Rationale**: Already used throughout the project. Strict mode catches
  null/undefined errors at compile time.
- **Alternatives considered**: None — existing project convention.

### Backend Framework

- **Decision**: Express 4.x with Zod validation
- **Rationale**: Existing backend stack. Zod provides runtime validation for
  request payloads aligned with TypeScript types.
- **Alternatives considered**: None — existing project convention.

### Frontend Framework

- **Decision**: React 18 + Vite 6.x + React Router 6
- **Rationale**: Existing frontend stack. Vite provides fast dev iteration.
- **Alternatives considered**: None — existing project convention.

### State Management

- **Decision**: Zustand (existing pattern in `roomStore.ts`)
- **Rationale**: Lightweight, no boilerplate, already used in project.
- **Alternatives considered**: React Context — viable but Zustand already adopted.

### Testing

- **Decision**: Vitest (both backend and frontend)
- **Rationale**: Already configured in both apps. Shares Vite config. Fast.
- **Alternatives considered**: Jest — would require separate config.

### Storage

- **Decision**: In-memory `Map<string, Room>`
- **Rationale**: Project constraint — no databases. Map provides O(1) lookup by
  room code.
- **Alternatives considered**: None — per project constraints.

### Polling Mechanism

- **Decision**: `setInterval` with `fetch` on the frontend, target ~2s interval
- **Rationale**: HTTP polling is the only allowed sync mechanism per project
  constraints. 2s balances responsiveness with server load.
- **Alternatives considered**: WebSockets (forbidden), Server-Sent Events
  (forbidden — would require persistent connections), manual refresh button
  (existing pattern, being replaced).

### Host Tracking

- **Decision**: `hostId` field on Room model, set to creator's participant ID
- **Rationale**: Simple, deterministic, no need for host election logic.
- **Alternatives considered**: Host as first participant array element — fragile
  if participants reordered.

### Error Response Format

- **Decision**: JSON with `{ error: string }` shape, HTTP 400 for validation
  errors, 404 for not-found
- **Rationale**: Existing Express error-handling middleware pattern.
- **Alternatives considered**: Custom error codes — unnecessary complexity for
  this scope.

## Dependencies

### Existing (no changes needed)

- `express`, `express-zod-api` — backend routing
- `react`, `react-dom`, `react-router-dom` — frontend
- `zod` — validation
- `vitest` — testing
- `zustand` — state management

### New Dependencies Needed

- None — all required functionality uses existing imports

## Best Practices

### API Error Handling

Return consistent JSON error responses with descriptive messages. Express error
middleware catches Zod validation errors and converts to 400 responses. Extend
to handle 403 (host-only action) and 409 (room full, duplicate join) cases.

### Frontend Polling Pattern

Start polling on lobby mount, clear interval on unmount. Use `useEffect` cleanup
to prevent stale intervals. Handle fetch failures gracefully (network loss)
without crashing the UI.

### State Updates

Zustand store actions should remain pure — compute new state from current state
plus action payload. Avoid side effects in store actions; keep fetch calls in
custom hooks or page components.
