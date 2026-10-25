import type { Candidate, Job, JlptLevel, Match, MatchBreakdown } from "./types";

/** How much each part counts towards the 0-100 score. Sums to 1. */
export const WEIGHTS: Record<keyof MatchBreakdown, number> = {
  skills: 0.5,
  experience: 0.2,
  language: 0.2,
  location: 0.1,
};

const norm = (s: string) => s.trim().toLowerCase();

/** N1 is the strongest level, so it gets the highest rank. */
export function jlptRank(level?: JlptLevel): number {
  return level ? 6 - Number(level.slice(1)) : 0;
}

export function skillScore(job: Job, c: Candidate): { score: number; missing: string[] } {
  if (job.skills.length === 0) return { score: 1, missing: [] };
  const have = new Set(c.skills.map(norm));
  const missing = job.skills.filter((s) => !have.has(norm(s)));
  return { score: (job.skills.length - missing.length) / job.skills.length, missing };
}

export function experienceScore(job: Job, c: Candidate): number {
  if (job.minYears <= 0) return 1;
  return Math.min(1, c.years / job.minYears);
}

export function languageScore(job: Job, c: Candidate): number {
  if (!job.japanese) return 1;
  const need = jlptRank(job.japanese);
  const have = jlptRank(c.japanese);
  if (have >= need) return 1;
  // one level short still counts for something; none at all counts for nothing
  return have === 0 ? 0 : Math.max(0, 1 - (need - have) * 0.5);
}

export function locationScore(job: Job, c: Candidate): number {
  if (norm(job.location) === norm(c.location)) return 1;
  if (job.remote && c.openToRemote) return 1;
  return job.remote ? 0.5 : 0;
}

export function matchCandidate(job: Job, c: Candidate): Match {
  const skills = skillScore(job, c);
  const breakdown: MatchBreakdown = {
    skills: skills.score,
    experience: experienceScore(job, c),
    language: languageScore(job, c),
    location: locationScore(job, c),
  };
  const total = (Object.keys(WEIGHTS) as (keyof MatchBreakdown)[]).reduce(
    (sum, k) => sum + WEIGHTS[k] * breakdown[k],
    0,
  );
  return { candidate: c, score: Math.round(total * 100), breakdown, missingSkills: skills.missing };
}

/** All candidates for a job, best match first (ties: more experience first, then name). */
export function rankCandidates(job: Job, candidates: Candidate[]): Match[] {
  return candidates
    .map((c) => matchCandidate(job, c))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.years - a.candidate.years ||
        a.candidate.name.localeCompare(b.candidate.name),
    );
}

export function formatSalary(min: number, max: number): string {
  const f = (n: number) => `RM ${n.toLocaleString("en-MY")}`;
  return min === max ? f(min) : `${f(min)} – ${f(max)}`;
}
