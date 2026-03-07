"use client";

import type { SoMMetrics } from "@/lib/types";

interface Props {
  metrics: SoMMetrics;
}

function getColor(score: number): string {
  if (score >= 60) return "#22c55e";
  if (score >= 30) return "#eab308";
  return "#ef4444";
}

function getLabel(score: number): string {
  if (score >= 60) return "Strong";
  if (score >= 30) return "Moderate";
  return "Weak";
}

export default function ScoreGauge({ metrics }: Props) {
  const score = metrics.share_of_model;
  const color = getColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Share of Model (SoM)
      </h3>
      <div className="flex items-center gap-8">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#27272a"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {score.toFixed(0)}%
            </span>
            <span className="text-xs font-medium" style={{ color }}>
              {getLabel(score)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Stat
            label="Queries Analyzed"
            value={String(metrics.total_queries)}
          />
          <Stat
            label="Brand Mentioned In"
            value={`${metrics.queries_with_brand} / ${metrics.total_queries}`}
          />
          <Stat
            label="Avg Position"
            value={
              metrics.average_position
                ? `#${metrics.average_position.toFixed(1)}`
                : "N/A"
            }
          />
          <Stat
            label="Citation Presence"
            value={`${metrics.citation_presence.toFixed(0)}%`}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
