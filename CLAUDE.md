# StudySync AI — Multi-Agent Development Rules

## Project Overview
StudySync AI is a hackathon project using React, Vite, Tailwind CSS, Node.js, Express, and an LLM API.

It turns students' lecture slides, PDFs, and class notes into study guides, flashcards, practice quizzes, and grounded Q&A.

Two developers use separate Claude Code sessions to build this application simultaneously.

Hackathon window: 10:00 AM – 3:30 PM. Prioritize a working MVP over polish.

## Agent Responsibilities

### Agent 1 — Backend Developer & Project Coordinator
Responsible for:
- Express server
- API endpoints
- PDF text extraction
- AI API integration
- Input validation
- Backend error handling
- Backend tests
- Maintaining `API_CONTRACT.md` (changes still require Agent 2's agreement)

Primary ownership: `server/`

### Agent 2 — Frontend Developer
Responsible for:
- React frontend
- Tailwind CSS
- Dashboard and navigation
- Document upload interface
- Study guide interface
- Flashcards
- Quiz interface
- Ask-a-question interface
- Client-side state (uploaded document text lives in the browser for the MVP)

Primary ownership: `client/`

## File and Directory Ownership

| Path | Owner | Notes |
|------|-------|-------|
| `server/**` | Agent 1 | Includes `server/package.json`, `server/.env.example` |
| `client/**` | Agent 2 | Includes `client/package.json`, `client/vite.config.*`, Tailwind config |
| `API_CONTRACT.md` | Shared | Agent 1 drafts; both must agree to changes |
| `CLAUDE.md` | Shared | Changes require both developers' approval |
| `README.md` | Shared | Each agent may add to its own section only |
| `.gitignore` | Shared | Coordinate before editing |
| Root `package.json` / root config | Shared | None exists yet; do not create without agreement |

If a task requires touching a file you do not own, stop, explain the proposed change, and ask for approval. Prefer asking the owning agent (via their developer) to make the change.

## Critical Collaboration Rules

1. NEVER overwrite another agent's work.
2. NEVER delete or substantially refactor code belonging to the other agent without explicit developer approval.
3. Agent 1 must work on `feature/backend`.
4. Agent 2 must work on `feature/frontend`.
5. NEVER push directly to `main`.
6. NEVER force-push.
7. NEVER perform destructive Git operations such as `git reset --hard`, `git clean -fd`, or `git push --force` without explicit approval.
8. Before editing a file, inspect its current contents.
9. Before modifying shared files, explain the proposed changes and request approval.
10. Do not automatically merge branches.
11. Keep changes small, focused, and easy to review.
12. Commit only files related to the assigned task.
13. Do not commit API keys, `.env` files, or secrets.
14. Do not rewrite project configuration unnecessarily.
15. Never overwrite or discard another developer's uncommitted work (no `git checkout -- <file>`, `git stash drop`, etc. on files you did not change).

## Git Workflow

- `main` — stable, integrated application. Updated only through reviewed pull requests.
- `feature/backend` — Agent 1's branch.
- `feature/frontend` — Agent 2's branch.
- Separate branches do NOT prevent conflicts in shared files. Communicate before touching them.
- To pick up the other agent's merged work: `git fetch origin` then `git merge origin/main` into your feature branch (no rebasing of pushed branches).
- Pushing your own feature branch is fine; opening a PR is fine; merging requires a human decision.

### Commits
- Small, focused commits with a prefix: `feat(server): ...`, `fix(client): ...`, `docs: ...`, `test(server): ...`, `chore: ...`.
- Review `git diff --staged` before every commit. Stage files explicitly (avoid `git add -A` / `git add .`).

### Pull Requests
- Target `main`. Title uses the same prefix style as commits.
- Description must include: what changed, files touched, how it was tested, and any dependency on the other agent's work.
- The other developer should review any PR that touches shared files or the API contract.

## Shared Files

The following files require coordination:
- Root `package.json`
- `CLAUDE.md`
- Root configuration files
- `.gitignore`
- Shared API contracts (`API_CONTRACT.md`)
- Environment variable documentation (`server/.env.example`)

## API Coordination

Backend and frontend must agree on:
- API endpoint paths
- Request body formats
- Response JSON structures
- Error response formats

Document the API contract before implementing dependent features.

- The source of truth is `API_CONTRACT.md` at the repo root.
- Do not change an endpoint's path, request shape, or response shape without updating `API_CONTRACT.md` in the same PR and getting the other developer's agreement.
- Additive changes (new optional fields) are preferred over breaking changes.
- The frontend must not depend on behavior that is not in the contract.

## Local Development Conventions

- Backend runs on `http://localhost:3001`; all routes are under `/api`.
- Frontend (Vite) runs on `http://localhost:5173` and proxies `/api` to the backend.
- Backend secrets go in `server/.env` (git-ignored). Document every variable in `server/.env.example` with a placeholder value.
- `MOCK_AI=true` makes the backend return fixed sample data so the frontend can be built without an AI key.

## Testing Requirements

- Backend: endpoint tests for success paths and validation errors must pass before opening a PR (`npm test` in `server/`).
- Frontend: `npm run build` in `client/` must succeed before opening a PR.
- Never call the real AI API in automated tests; use mock mode.
- Manually verify any endpoint or screen you change before reporting it done.

## Before Starting Work

1. Run `git status`.
2. Confirm the current branch.
3. Inspect relevant existing files.
4. State which files will be modified.
5. Verify that the task falls within the agent's responsibilities.
6. If the task overlaps another agent's work, request approval before proceeding.

## After Finishing Work

1. Run relevant tests or build checks.
2. Review `git diff`.
3. Summarize files changed.
4. Explain any dependencies on the other agent's work.
5. Never merge into `main` automatically.

Protect existing functionality and prioritize collaboration over speed.
