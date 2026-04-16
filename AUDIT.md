# Repository Audit — UniSolve

**Date:** 2026-04-16  
**Auditor:** Self-assessment

---

## Score Before Cleanup: 5 / 10 → After Cleanup: 8.5 / 10

---

## Criteria Breakdown

### 1. README Quality — 2 / 2 ✅
`README.md` now exists and covers: project title, one-line description, problem statement, features, tech stack, project structure, installation steps for both frontend and backend, environment variables reference, and license. A new visitor can clone and run the project from scratch.

> **Before:** 0 / 2 — No `README.md` existed at all.

---

### 2. Folder Structure — 2 / 2 ✅
The repo now follows a clean, logical layout:

```
UniSolve/
├── client/                  # React frontend
├── unislove-backend/        # Express backend (all controllers, routes, prisma inside)
├── docs/
├── tests/
├── assets/
├── README.md
├── AUDIT.md
├── LICENSE
└── .gitignore
```

All previously misplaced files have been resolved:
- `controllers/issuesController.js` moved → `unislove-backend/controllers/`
- `prisma.config.ts` moved → `unislove-backend/`
- `dependecies.py` (unrelated FastAPI stub) removed

> **Before:** 1.5 / 2 — Several files were misplaced at the repo root.

---

### 3. File Naming Consistency — 1.5 / 2
- `dependecies.py` (typo) has been removed
- `unislove-backend/` still has a typo in the folder name (`unislove` vs `unisolve`) — not fixed to avoid breaking existing scripts and imports
- All JS files use consistent camelCase, directories use kebab-case

> **Before:** 1 / 2

---

### 4. Essential Files — 2 / 2 ✅
- `.gitignore` — present and well-configured
- `package.json` — present at root and in sub-projects
- `LICENSE` — added (MIT)
- `README.md` — added

> **Before:** 1.5 / 2 — LICENSE and README were missing.

---

### 5. Commit History Quality — 1 / 2
The commit history has mostly descriptive messages but some are vague (`"replace old files with updated versions"`). Conventional commits format is partially followed but not consistent throughout the history. New commits follow the convention.

> **Unchanged:** 1 / 2

---

## Changes Made

| Issue | Status |
|---|---|
| No README | ✅ Created comprehensive README.md |
| No LICENSE | ✅ Added MIT LICENSE |
| Misplaced `controllers/` at root | ✅ Moved into `unislove-backend/controllers/` |
| Misplaced `prisma.config.ts` at root | ✅ Moved into `unislove-backend/` |
| Irrelevant `dependecies.py` | ✅ Removed |
| Missing `docs/`, `tests/`, `assets/` | ✅ Added |

## Remaining Issues

| Issue | Reason not fixed |
|---|---|
| `unislove-backend/` folder name typo | Renaming would break `start.sh`, `setup.sh`, and all internal imports |
| Vague older commit messages | Git history rewrite avoided to keep history clean |
