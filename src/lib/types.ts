export type JlptLevel = "N1" | "N2" | "N3" | "N4" | "N5";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salaryMin: number; // MYR per month
  salaryMax: number;
  minYears: number;
  skills: string[]; // required skills
  japanese?: JlptLevel; // minimum Japanese level, if the role needs it
  summary: string;
}

export interface Candidate {
  id: string;
  name: string;
  headline: string;
  location: string;
  openToRemote: boolean;
  years: number;
  skills: string[];
  japanese?: JlptLevel;
  expectedSalary: number; // MYR per month
}

export interface MatchBreakdown {
  skills: number; // 0..1 share of required skills the candidate has
  experience: number; // 0..1
  language: number; // 0..1
  location: number; // 0..1
}

export interface Match {
  candidate: Candidate;
  score: number; // 0..100
  breakdown: MatchBreakdown;
  missingSkills: string[];
}
