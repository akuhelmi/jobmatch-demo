import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, jobs } from "@/data/jobs";
import { candidates } from "@/data/candidates";
import { formatSalary, rankCandidates, WEIGHTS } from "@/lib/match";
import type { MatchBreakdown } from "@/lib/types";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

const LABELS: Record<keyof MatchBreakdown, string> = {
  skills: "Skills",
  experience: "Experience",
  language: "Japanese",
  location: "Location",
};

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();
  const matches = rankCandidates(job, candidates);

  return (
    <>
      <Link href="/" className="back">
        ← All roles
      </Link>
      <section className="card job-head">
        <h1>{job.title}</h1>
        <p className="muted">
          {job.company} · {job.location}
          {job.remote ? " · remote OK" : ""} · {job.minYears}+ years
          {job.japanese ? ` · Japanese ${job.japanese}+` : ""}
        </p>
        <p className="salary">{formatSalary(job.salaryMin, job.salaryMax)} / month</p>
        <p>{job.summary}</p>
        <div className="chips">
          {job.skills.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </section>

      <h2 className="section-title">Ranked candidates</h2>
      <p className="muted small">
        Score = {Object.entries(WEIGHTS)
          .map(([k, w]) => `${LABELS[k as keyof MatchBreakdown]} ${Math.round(w * 100)}%`)
          .join(" · ")}
      </p>
      <ol className="match-list">
        {matches.map((m) => (
          <li key={m.candidate.id} className="card match">
            <div className="match-top">
              <div>
                <h3>{m.candidate.name}</h3>
                <p className="muted">
                  {m.candidate.headline} · {m.candidate.location} · {m.candidate.years} yrs
                </p>
              </div>
              <div className={`score ${m.score >= 80 ? "hi" : m.score >= 60 ? "mid" : "lo"}`}>{m.score}%</div>
            </div>
            <div className="bars">
              {(Object.keys(LABELS) as (keyof MatchBreakdown)[]).map((k) => (
                <div key={k} className="bar-row">
                  <span>{LABELS[k]}</span>
                  <div className="bar">
                    <div style={{ width: `${Math.round(m.breakdown[k] * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {m.missingSkills.length > 0 && (
              <p className="missing">Missing: {m.missingSkills.join(", ")}</p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
