# StudySync AI — Multi-Agent Development Rules

## Project Overview
StudySync AI is a hackathon project using React, Vite, Tailwind CSS, Node.js, Express, and an LLM API.

Two developers use separate Claude Code sessions to build this application simultaneously.

## Agent Responsibilities

### Agent 1 — Backend Developer
Responsible for:
- Express server
- API endpoints
- PDF text extraction
- AI API integration
- Input validation
- Backend error handling

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

Primary ownership: `client/`

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

## Shared Files

The following files require coordination:
- Root `package.json`
- `CLAUDE.md`
- Root configuration files
- `.gitignore`
- Shared API contracts
- Environment variable documentation

## API Coordination

Backend and frontend must agree on:
- API endpoint paths
- Request body formats
- Response JSON structures
- Error response formats

Document the API contract before implementing dependent features.

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