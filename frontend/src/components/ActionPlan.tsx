"use client";

import type { Recommendation } from "@/lib/types";

interface Props {
  recommendations: Recommendation[];
}

const IMPACT_COLORS = {
  high: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  low: "text-zinc-400 bg-zinc-700",
};

const EFFORT_COLORS = {
  low: "text-green-400 bg-green-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  high: "text-red-400 bg-red-500/10",
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Action Plan ({recommendations.length} recommendations)
      </h3>
      <div className="space-y-4">
        {sorted.map((rec, i) => (
          <div
            key={i}
            className="border border-zinc-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{rec.category}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${IMPACT_COLORS[rec.impact]}`}
                >
                  Impact: {rec.impact}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EFFORT_COLORS[rec.effort]}`}
                >
                  Effort: {rec.effort}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">{rec.description}</p>
            {rec.action_steps.length > 0 && (
              <ol className="space-y-1.5 ml-4">
                {rec.action_steps.map((step, j) => (
                  <li
                    key={j}
                    className="text-xs text-zinc-400 list-decimal"
                  >
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
