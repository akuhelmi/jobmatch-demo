# JobMatch (demo)

A small job-matching app: open roles, candidates, and a **transparent match score** for every
candidate against every job (skills 50%, experience 20%, Japanese level 20%, location 10%).
All data is fictional and seeded in `src/data/`.

It exists to demo **AI-driven development**: tasks are written in Notion, an AI coding agent
picks them up, writes a short scope, implements and tests the change, and a human approves every
outward step (the push) from a phone. GitHub Actions then runs CI and deploys to Vercel.

```
Notion task → agent: scope → code + tests → human "Go" → git push → CI (lint · typecheck · test · build) → Vercel
```

## Stack
Next.js 15 (App Router) · TypeScript · Vitest · ESLint · GitHub Actions · Vercel

## Run it
```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

## Layout
- `src/lib/match.ts`: the scoring engine (pure functions) with unit tests in `match.test.ts`
- `src/data/`: seeded jobs and candidates
- `src/app/`: the job list and the ranked-candidates page
- `.github/workflows/ci.yml`: CI on every push/PR; production deploy on `main` after CI passes
