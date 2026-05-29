<!--
  Sync Impact Report
  Version change: N/A (template) → 1.0.0
  Modified principles: N/A (all new — initial population)
  Added sections: Core Principles (I-V), Game Logic Constraints, Development Workflow & Review Process, Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/tasks-template.md: ⚠ updated (testing guidance now mandatory per Principle V)
    - .specify/templates/plan-template.md: ✅ no change needed
    - .specify/templates/spec-template.md: ✅ no change needed
    - .specify/templates/agent-file-template.md: ✅ no change needed
    - .specify/templates/checklist-template.md: ✅ no change needed
  Follow-up TODOs:
    - TODO(RATIFICATION_DATE): Original adoption date unknown — needs manual determination
-->

# Scribble Constitution

## Core Principles

### I. Type Safety & Strict Typing

All code MUST be fully typed with TypeScript. The `any` type is strictly forbidden;
use `unknown` for truly dynamic values. Every function signature, API payload, and
state shape MUST have an explicit type. No implicit `any` is permitted. This ensures
the compiler catches type errors before runtime, reducing the feedback loop and
preventing class-of-bugs that are expensive to diagnose in a multiplayer game.

### II. Modular Architecture & Separation of Concerns

The backend MUST follow a strict three-layer separation: `src/api` (routes and
request handling), `src/services` (business logic), `src/models` (data types and
entities). The frontend MUST use functional components with hooks. Cross-cutting
concerns MUST be extracted into shared modules. No layer shall bypass another.
This keeps each concern independently testable and replaceable.

### III. AI-Assisted Development Discipline

AI-generated code MUST be reviewed, understood, and validated before committing.
The developer remains fully responsible for all code quality, correctness, and
security. AI MUST NOT introduce unauthorized dependencies, WebSockets, databases,
authentication, or any feature listed as out-of-scope in the README. All AI output
MUST be verified against the feature specification and this constitution. Blind
acceptance of AI suggestions is a violation of this principle.

### IV. Self-Review & Quality Gates

Every change MUST pass these quality gates before merging:
1. Code compiles without errors (`npm run build` in both backend and frontend).
2. Linter produces zero warnings.
3. All tests pass.
4. No console errors in the browser during manual verification.
5. The change matches the acceptance criteria in the spec.
Reviews MUST verify constitution compliance. Complexity MUST be justified when it
exceeds what the spec requires.

### V. Testing & Deterministic Validation

Testing MUST cover contract tests for API endpoints, integration tests for user
journeys, and the acceptance criteria from the spec. Game logic MUST be
deterministic: given the same inputs, the same outputs MUST be produced every time.
Tests MUST be written and observed to fail before implementation code is written
(test-first). This prevents regression in a stateful game where multiple clients
interact through a shared backend.

## Game Logic Constraints

All game state MUST be derived deterministically from room data. Randomness or
timestamps MUST NOT affect core game rules beyond what the spec explicitly defines.

- Player names MUST be trimmed; empty or whitespace-only names MUST be rejected.
- Guess comparison MUST be case-insensitive after trimming.
- Scoring MUST be exactly 100 for a correct guess and 0 otherwise — no partial
  credit, no bonuses.
- The secret word MUST be selected deterministically from the seed word list.
- Round state transitions MUST follow: `lobby -> drawing -> result -> lobby`
  (restart).

## Development Workflow & Review Process

Follow the Spec Kit loop: **Discovery -> Specify -> Clarify -> Plan -> Tasks ->
Implement -> Validate**.

Each phase MUST produce the required artifacts. Implementation MUST proceed in the
build order recommended by the README. Commits MUST be granular, meaningful, and
traceable to spec items. Every feature group MUST be validated against acceptance
criteria using two browser tabs before marking complete — the multiplayer nature
of the game demands cross-client verification.

## Governance

This constitution supersedes all ad-hoc practices and informal conventions.

**Amendment procedure:**
1. Document the rationale for the change.
2. Obtain approval from the project maintainer.
3. Provide a migration plan for affected processes and artifacts.

**Versioning policy:** MAJOR.MINOR.PATCH
- MAJOR: backward-incompatible principle removals or redefinitions.
- MINOR: new principle or materially expanded guidance.
- PATCH: clarifications, wording fixes, non-semantic refinements.

**Compliance review:** All PRs and reviews MUST verify constitution compliance.
Use `AGENTS.md` for runtime agent guidance. Complexity that cannot be justified
against the spec MUST be flagged and reworked.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-05-29
