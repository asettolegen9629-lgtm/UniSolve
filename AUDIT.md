# Repository Audit — UniSolve

**Date:** 2026-04-16  
**Auditor:** Self-assessment

---

## Score: 5 / 10

---

## Criteria Breakdown

### 1. README Quality — 0 / 2
No `README.md` exists at all. A visitor cloning the repository has no idea what the project is, how to install it, or how to run it. This is the most critical gap.

### 2. Folder Structure — 1.5 / 2
The main structure is reasonable: `client/` holds the React frontend and `unislove-backend/` holds the Node.js/Express backend. However, several files are misplaced:
- `controllers/issuesController.js` sits at the repo root instead of inside `unislove-backend/controllers/`
- `prisma.config.ts` sits at the repo root instead of inside `unislove-backend/`
- `dependecies.py` is an unrelated FastAPI hello-world stub that does not belong in a Node.js/React project
- No `docs/`, `tests/`, or `assets/` directories exist

### 3. File Naming Consistency — 1 / 2
- `dependecies.py` has a typo (missing an 'n')
- `unislove-backend/` has a typo in the folder name (`unislove` vs `unisolve`)
- Otherwise, naming is consistent (camelCase for JS files, kebab-case for directories)

### 4. Essential Files — 1.5 / 2
- `.gitignore` — present and well-configured
- `package.json` — present at root and in sub-projects
- `LICENSE` — **missing**
- `README.md` — **missing**

### 5. Commit History Quality — 1 / 2
The commit history exists with mostly descriptive messages. Some commits are vague (`"be71a93 replace old files with updated versions"`). Conventional commits format is partially followed but not consistently.

---

## Action Plan

| Issue | Action |
|---|---|
| No README | Create comprehensive README.md |
| No LICENSE | Add MIT LICENSE |
| Misplaced `controllers/` | Move into `unislove-backend/controllers/` |
| Misplaced `prisma.config.ts` | Move into `unislove-backend/` |
| Irrelevant `dependecies.py` | Remove |
| Missing directories | Add `docs/`, `tests/`, `assets/` |
