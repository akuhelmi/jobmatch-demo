import { describe, expect, it } from "vitest";
import {
  experienceScore,
  filterByMinScore,
  formatSalary,
  jlptRank,
  languageScore,
  locationScore,
  matchCandidate,
  MIN_SCORE_OPTIONS,
  rankCandidates,
  skillScore,
  WEIGHTS,
} from "./match";
import type { Candidate, Job, Match } from "./types";

const job: Job = {
  id: "j1",
  title: "Full Stack Engineer",
  company: "Acme KK",
  location: "Kuala Lumpur",
  remote: false,
  salaryMin: 8000,
  salaryMax: 12000,
  minYears: 4,
  skills: ["TypeScript", "React", "Node.js", "SQL"],
  japanese: "N3",
  summary: "",
};

const cand = (over: Partial<Candidate> = {}): Candidate => ({
  id: "c1",
  name: "Aina",
  headline: "",
  location: "Kuala Lumpur",
  openToRemote: false,
  years: 4,
  skills: ["typescript", "React", "Node.js", "SQL"],
  japanese: "N3",
  expectedSalary: 9000,
  ...over,
});

describe("weights", () => {
  it("sum to 1", () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});

describe("skillScore", () => {
  it("matches skills case-insensitively", () => {
    expect(skillScore(job, cand())).toEqual({ score: 1, missing: [] });
  });
  it("lists the missing skills", () => {
    expect(skillScore(job, cand({ skills: ["React", "SQL"] }))).toEqual({
      score: 0.5,
      missing: ["TypeScript", "Node.js"],
    });
  });
  it("is full when the job lists no skills", () => {
    expect(skillScore({ ...job, skills: [] }, cand({ skills: [] })).score).toBe(1);
  });
});

describe("experienceScore", () => {
  it("caps at 1", () => expect(experienceScore(job, cand({ years: 10 }))).toBe(1));
  it("is proportional below the minimum", () => expect(experienceScore(job, cand({ years: 2 }))).toBe(0.5));
});

describe("languageScore", () => {
  it("ranks N1 highest", () => expect(jlptRank("N1")).toBeGreaterThan(jlptRank("N5")));
  it("is full at or above the level", () => expect(languageScore(job, cand({ japanese: "N1" }))).toBe(1));
  it("is half one level short", () => expect(languageScore(job, cand({ japanese: "N4" }))).toBe(0.5));
  it("is zero without Japanese", () => expect(languageScore(job, cand({ japanese: undefined }))).toBe(0));
  it("is full when the job needs none", () =>
    expect(languageScore({ ...job, japanese: undefined }, cand({ japanese: undefined }))).toBe(1));
});

describe("locationScore", () => {
  it("is full in the same city", () => expect(locationScore(job, cand())).toBe(1));
  it("is zero elsewhere for an on-site job", () => expect(locationScore(job, cand({ location: "Penang" }))).toBe(0));
  it("is full for a remote job and a remote-open candidate", () =>
    expect(locationScore({ ...job, remote: true }, cand({ location: "Penang", openToRemote: true }))).toBe(1));
});

describe("matchCandidate / rankCandidates", () => {
  it("gives a perfect candidate 100", () => expect(matchCandidate(job, cand()).score).toBe(100));
  it("ranks the better match first", () => {
    const weak = cand({ id: "c2", name: "Ben", skills: ["SQL"], japanese: undefined });
    const ranked = rankCandidates(job, [weak, cand()]);
    expect(ranked.map((m) => m.candidate.id)).toEqual(["c1", "c2"]);
    expect(ranked[1].score).toBeLessThan(ranked[0].score);
  });
  it("breaks ties by experience", () => {
    const a = cand({ id: "a", name: "A", years: 6 });
    const b = cand({ id: "b", name: "B", years: 4 });
    expect(rankCandidates(job, [b, a]).map((m) => m.candidate.id)).toEqual(["a", "b"]);
  });
});

describe("formatSalary", () => {
  it("formats a range in MYR", () => expect(formatSalary(8000, 12000)).toBe("RM 8,000 – RM 12,000"));
  it("formats a single amount", () => expect(formatSalary(5000, 5000)).toBe("RM 5,000"));
});

describe("filterByMinScore", () => {
  const withScore = (id: string, score: number): Match => ({
    candidate: cand({ id, name: id }),
    score,
    breakdown: { skills: 1, experience: 1, language: 1, location: 1 },
    missingSkills: [],
  });
  const ranked = [withScore("a", 92), withScore("b", 70), withScore("c", 69), withScore("d", 40)];
  const ids = (ms: Match[]) => ms.map((m) => m.candidate.id);

  it("offers the four ticket options", () => {
    expect(MIN_SCORE_OPTIONS).toEqual([0, 50, 70, 85]);
  });

  it("keeps everyone at minimum 0", () => {
    expect(filterByMinScore(ranked, 0)).toEqual({ shown: ranked, hidden: 0 });
  });

  it("keeps a score equal to the minimum and hides the ones below", () => {
    const r = filterByMinScore(ranked, 70);
    expect(ids(r.shown)).toEqual(["a", "b"]);
    expect(r.hidden).toBe(2);
  });

  it("keeps the ranking order", () => {
    expect(ids(filterByMinScore(ranked, 50).shown)).toEqual(["a", "b", "c"]);
  });

  it("can hide everyone", () => {
    expect(filterByMinScore([withScore("c", 69)], 85)).toEqual({ shown: [], hidden: 1 });
  });

  it("handles an empty list", () => {
    expect(filterByMinScore([], 85)).toEqual({ shown: [], hidden: 0 });
  });
});
