"use client";

import type { CompetitorEntry } from "@/lib/types";

interface Props {
  competitors: CompetitorEntry[];
}

export default function SentimentChart({ competitors }: Props) {
  const top = competitors.slice(0, 8);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Sentiment Breakdown
      </h3>
      <div className="space-y-3">
        {top.map((c) => {
          const total =
            c.sentiment_breakdown.positive +
            c.sentiment_breakdown.neutral +
            c.sentiment_breakdown.negative;
          if (total === 0) return null;

          return (
            <div key={c.brand_name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span
                  className={
                    c.is_target_brand
                      ? "text-blue-400 font-medium"
                      : "text-zinc-400"
                  }
                >
                  {c.brand_name}
                </span>
                <span className="text-zinc-500">{total} mentions</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-zinc-800">
                <div
                  className="bg-green-500 transition-all"
                  style={{
                    width: `${(c.sentiment_breakdown.positive / total) * 100}%`,
                  }}
                />
                <div
                  className="bg-yellow-500 transition-all"
                  style={{
                    width: `${(c.sentiment_breakdown.neutral / total) * 100}%`,
                  }}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{
                    width: `${(c.sentiment_breakdown.negative / total) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Negative
        </span>
      </div>
    </div>
  );
}
