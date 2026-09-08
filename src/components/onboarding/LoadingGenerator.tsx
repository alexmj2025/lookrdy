"use client";

import { useEffect, useState } from "react";
import { Check } from "./icons";

const STAGES = [
  "Understanding your photo",
  "Reading your style preferences",
  "Building your outfit directions",
  "Matching your budget",
  "Finding real products",
  "Creating your three looks",
];

/**
 * The generation wait.
 *
 * The stage timings are presentational, not a real pipeline readout — the
 * generate call is one request that doesn't stream progress. The ring
 * deliberately eases toward 90% and stops there rather than pretending to
 * finish: it completes only when the response actually lands, so the UI never
 * claims to be done while the user is still waiting.
 */
export function LoadingGenerator({ done }: { done: boolean }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 2600);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    if (done) {
      setProgress(100);
      setStage(STAGES.length);
      return;
    }
    const id = setInterval(() => {
      // Approach 90% asymptotically; the last 10% belongs to the real result.
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.4, (90 - p) * 0.045)));
    }, 240);
    return () => clearInterval(id);
  }, [done]);

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div className="onb-gen">
      <div>
        <div className="onb-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="onb-ring__track" cx="50" cy="50" r={R} />
            <circle
              className="onb-ring__value"
              cx="50"
              cy="50"
              r={R}
              strokeDasharray={C}
              strokeDashoffset={C - (C * progress) / 100}
            />
          </svg>
          <span className="onb-ring__pct">{Math.round(progress)}%</span>
        </div>

        <h1 className="onb-h1" style={{ marginTop: "2rem", fontSize: "1.5rem" }}>
          {done ? "Your looks are ready" : "Creating your looks"}
        </h1>
        <p className="onb-lede" style={{ margin: "0.5rem auto 0" }}>
          This usually takes under a minute.
        </p>

        <ul className="onb-stages" aria-live="polite">
          {STAGES.map((label, i) => {
            const state = i < stage ? "done" : i === stage ? "active" : "todo";
            return (
              <li className="onb-stage" data-state={state} key={label}>
                <span className="onb-stage__mark">
                  <Check size={12} />
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
