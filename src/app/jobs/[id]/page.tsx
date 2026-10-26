import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, jobs } from "@/data/jobs";
import { candidates } from "@/data/candidates";
import { formatSalary, rankCandidates, WEIGHTS } from "@/lib/match";
import type { MatchBreakdown } from "@/lib/types";
import { CandidateList } from "./CandidateList";
import { LABELS } from "./labels";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.id }));
}

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
      <CandidateList matches={matches} />
    </>
  );
}
