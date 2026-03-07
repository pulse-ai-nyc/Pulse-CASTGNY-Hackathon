"use client";

import { useState } from "react";
import type { CompetitorEntry } from "@/lib/types";

interface Props {
  competitors: CompetitorEntry[];
}

type SortKey = "mention_count" | "share_of_voice" | "average_position";

export default function CompetitorTable({ competitors }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("share_of_voice");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...competitors].sort((a, b) => {
    const diff = sortAsc
      ? a[sortKey] - b[sortKey]
      : b[sortKey] - a[sortKey];
    return diff;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-zinc-400 cursor-pointer hover:text-white select-none"
      onClick={() => toggleSort(field)}
    >
      {label} {sortKey === field ? (sortAsc ? "\u2191" : "\u2193") : ""}
    </th>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <h3 className="text-sm font-medium text-zinc-400 px-6 py-4 border-b border-zinc-800">
        Competitor Analysis
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                Brand
              </th>
              <SortHeader label="Mentions" field="mention_count" />
              <SortHeader label="Share of Voice" field="share_of_voice" />
              <SortHeader label="Avg Position" field="average_position" />
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.brand_name}
                className={`border-t border-zinc-800 ${
                  c.is_target_brand ? "bg-blue-500/5" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {c.brand_name}
                  {c.is_target_brand && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      TARGET
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {c.mention_count}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  {c.share_of_voice.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">
                  #{c.average_position.toFixed(1)}
                </td>
                <td className="px-4 py-3">
                  <SentimentBar breakdown={c.sentiment_breakdown} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SentimentBar({
  breakdown,
}: {
  breakdown: { positive: number; neutral: number; negative: number };
}) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative;
  if (total === 0) return <span className="text-xs text-zinc-500">-</span>;

  const pPos = (breakdown.positive / total) * 100;
  const pNeu = (breakdown.neutral / total) * 100;
  const pNeg = (breakdown.negative / total) * 100;

  return (
    <div className="flex h-2 w-24 rounded-full overflow-hidden bg-zinc-800">
      {pPos > 0 && (
        <div className="bg-green-500" style={{ width: `${pPos}%` }} />
      )}
      {pNeu > 0 && (
        <div className="bg-yellow-500" style={{ width: `${pNeu}%` }} />
      )}
      {pNeg > 0 && (
        <div className="bg-red-500" style={{ width: `${pNeg}%` }} />
      )}
    </div>
  );
}
