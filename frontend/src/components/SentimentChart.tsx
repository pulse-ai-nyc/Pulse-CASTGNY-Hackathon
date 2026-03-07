"use client";

import type { CompetitorEntry } from "@/lib/types";

interface Props {
  competitors: CompetitorEntry[];
}

export default function SentimentChart({ competitors }: Props) {
  const top = competitors.slice(0, 8);

  return (
    <div className="card p-6 h-full">
      <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)] mb-5">
        Sentiment Breakdown
      </p>

      <div className="space-y-3">
        {top.map((c) => {
          const total =
            c.sentiment_breakdown.positive +
            c.sentiment_breakdown.neutral +
            c.sentiment_breakdown.negative;
          if (total === 0) return null;

          const pPos = (c.sentiment_breakdown.positive / total) * 100;
          const pNeu = (c.sentiment_breakdown.neutral / total) * 100;
          const pNeg = (c.sentiment_breakdown.negative / total) * 100;

          return (
            <div key={c.brand_name} className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span
                  className={`text-[12px] font-500 ${
                    c.is_target_brand
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-ink)]"
                  }`}
                >
                  {c.brand_name}
                  {c.is_target_brand && (
                    <span className="ml-1.5 text-[9px] font-[family-name:var(--font-mono)] font-500 px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                      YOU
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-ink-muted)]">
                  {total}
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-[var(--color-surface-alt)]">
                {pPos > 0 && (
                  <div
                    className="bg-[var(--color-success)] transition-all duration-500"
                    style={{ width: `${pPos}%` }}
                  />
                )}
                {pNeu > 0 && (
                  <div
                    className="bg-[var(--color-warning)] transition-all duration-500"
                    style={{ width: `${pNeu}%` }}
                  />
                )}
                {pNeg > 0 && (
                  <div
                    className="bg-[var(--color-danger)] transition-all duration-500"
                    style={{ width: `${pNeg}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 mt-5 pt-4 border-t border-[var(--color-border)]">
        <Legend color="var(--color-success)" label="Positive" />
        <Legend color="var(--color-warning)" label="Neutral" />
        <Legend color="var(--color-danger)" label="Negative" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
