"use client";

import type { SoMMetrics } from "@/lib/types";

interface Props {
  metrics: SoMMetrics;
}

function getColor(score: number) {
  if (score >= 60) return { stroke: "var(--color-success)", bg: "var(--color-success-light)", label: "Strong", labelColor: "var(--color-success)" };
  if (score >= 30) return { stroke: "var(--color-warning)", bg: "var(--color-warning-light)", label: "Moderate", labelColor: "var(--color-warning)" };
  return { stroke: "var(--color-danger)", bg: "var(--color-danger-light)", label: "Weak", labelColor: "var(--color-danger)" };
}

export default function ScoreGauge({ metrics }: Props) {
  const score = metrics.share_of_model;
  const { stroke, label, labelColor } = getColor(score);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card p-6 h-full">
      <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)] mb-5">
        Share of Model
      </p>

      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
            <circle
              cx="60" cy="60" r={r}
              fill="none"
              stroke={stroke}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-display)] text-3xl font-800 text-[var(--color-ink)] tracking-tight">
              {score.toFixed(0)}
            </span>
            <span className="text-[10px] font-600 tracking-wide uppercase" style={{ color: labelColor }}>
              {label}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 flex-1">
          <Stat label="Queries analyzed" value={String(metrics.total_queries)} />
          <Stat label="Brand mentioned" value={`${metrics.queries_with_brand} / ${metrics.total_queries}`} />
          <Stat
            label="Avg position"
            value={metrics.average_position ? `#${metrics.average_position.toFixed(1)}` : "N/A"}
          />
          <Stat label="Citation presence" value={`${metrics.citation_presence.toFixed(0)}%`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] text-[var(--color-ink-muted)]">{label}</span>
      <span className="text-[13px] font-[family-name:var(--font-mono)] font-500 text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
