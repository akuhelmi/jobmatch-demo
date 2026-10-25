import Link from "next/link";
import { jobs } from "@/data/jobs";
import { candidates } from "@/data/candidates";
import { formatSalary, rankCandidates } from "@/lib/match";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Open roles</h1>
        <p className="muted">
          {jobs.length} jobs · {candidates.length} candidates · every match score is explained
        </p>
      </section>

      <ul className="job-list">
        {jobs.map((job) => {
          const best = rankCandidates(job, candidates)[0];
          return (
            <li key={job.id} className="card job-card">
              <Link href={`/jobs/${job.id}`} className="job-link">
                <div className="job-top">
                  <h2>{job.title}</h2>
                  {job.japanese && <span className="pill jp">Japanese {job.japanese}+</span>}
                </div>
                <p className="muted">
                  {job.company} · {job.location}
                  {job.remote ? " · remote OK" : ""}
                </p>
                <p className="salary">{formatSalary(job.salaryMin, job.salaryMax)} / month</p>
                <div className="chips">
                  {job.skills.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
                {best && (
                  <p className="best">
                    Top match: <strong>{best.candidate.name}</strong> · {best.score}%
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
