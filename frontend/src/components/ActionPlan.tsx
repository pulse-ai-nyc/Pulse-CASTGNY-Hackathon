"use client";

import type { Recommendation } from "@/lib/types";

interface Props {
  recommendations: Recommendation[];
}

const IMPACT_STYLE = {
  high: { bg: "bg-[var(--color-success-light)]", text: "text-[var(--color-success)]", border: "border-[var(--color-success-wash)]" },
  medium: { bg: "bg-[var(--color-warning-light)]", text: "text-[var(--color-warning)]", border: "border-[var(--color-warning-wash)]" },
  low: { bg: "bg-[var(--color-surface-alt)]", text: "text-[var(--color-ink-muted)]", border: "border-[var(--color-border)]" },
};

const EFFORT_STYLE = {
  low: { bg: "bg-[var(--color-success-light)]", text: "text-[var(--color-success)]", border: "border-[var(--color-success-wash)]" },
  medium: { bg: "bg-[var(--color-warning-light)]", text: "text-[var(--color-warning)]", border: "border-[var(--color-warning-wash)]" },
  high: { bg: "bg-[var(--color-danger-light)]", text: "text-[var(--color-danger)]", border: "border-[var(--color-danger-wash)]" },
};

export default function ActionPlan({ recommendations }: Props) {
  const sorted = [...recommendations].sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const effortOrder = { low: 3, medium: 2, high: 1 };
    return (
      impactOrder[b.impact] * effortOrder[b.effort] -
      impactOrder[a.impact] * effortOrder[a.effort]
    );
  });

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)]">
          Action Plan
        </p>
        <span className="text-[11px] text-[var(--color-ink-faint)]">
          {recommendations.length} recommendations
        </span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {sorted.map((rec, i) => {
          const impact = IMPACT_STYLE[rec.impact];
          const effort = EFFORT_STYLE[rec.effort];

          return (
            <div key={i} className="px-6 py-5 hover:bg-[var(--color-surface-alt)]/30 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h4 className="text-[14px] font-600 text-[var(--color-ink)]">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-ink-muted)] mt-0.5">
                    {rec.category}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`text-[10px] font-[family-name:var(--font-mono)] font-500 px-2 py-0.5 rounded border ${impact.bg} ${impact.text} ${impact.border}`}>
                    {rec.impact} impact
                  </span>
                  <span className={`text-[10px] font-[family-name:var(--font-mono)] font-500 px-2 py-0.5 rounded border ${effort.bg} ${effort.text} ${effort.border}`}>
                    {rec.effort} effort
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[var(--color-ink-secondary)] leading-relaxed mb-3">
                {rec.description}
              </p>
              {rec.action_steps.length > 0 && (
                <ol className="space-y-1 pl-4">
                  {rec.action_steps.map((step, j) => (
                    <li key={j} className="text-[12px] text-[var(--color-ink-muted)] list-decimal leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
