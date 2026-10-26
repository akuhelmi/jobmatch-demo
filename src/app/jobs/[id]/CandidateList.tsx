"use client";

import { useState } from "react";
import { filterByMinScore, MIN_SCORE_OPTIONS } from "@/lib/match";
import type { Match, MatchBreakdown } from "@/lib/types";
import { LABELS } from "./labels";

export function CandidateList({ matches }: { matches: Match[] }) {
  const [minScore, setMinScore] = useState<number>(0);
  const { shown, hidden } = filterByMinScore(matches, minScore);

  return (
    <>
      <label className="filter">
        Minimum score{" "}
        <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
          {MIN_SCORE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}%
            </option>
          ))}
        </select>
      </label>
      {shown.length === 0 && <p className="muted">No candidates at this score or above.</p>}
      <ol className="match-list">
        {shown.map((m) => (
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
      {hidden > 0 && <p className="muted hidden-count">{hidden} hidden</p>}
    </>
  );
}
