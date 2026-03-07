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

  const sorted = [...competitors].sort((a, b) =>
    sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)]">
          Competitor Analysis
        </p>
        <span className="text-[11px] text-[var(--color-ink-faint)]">
          {competitors.length} brands
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-surface-alt)]">
              <th className="text-left px-6 py-3 text-[11px] font-500 text-[var(--color-ink-muted)]">
                Brand
              </th>
              <SortTh label="Mentions" field="mention_count" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <SortTh label="Share of Voice" field="share_of_voice" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <SortTh label="Avg Position" field="average_position" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <th className="text-left px-6 py-3 text-[11px] font-500 text-[var(--color-ink-muted)]">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.brand_name}
                className={`border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-alt)]/50 ${
                  c.is_target_brand ? "bg-[var(--color-accent-light)]/50" : ""
                }`}
              >
                <td className="px-6 py-3.5 text-[13px] font-500 text-[var(--color-ink)]">
                  <span className="flex items-center gap-2">
                    {c.brand_name}
                    {c.is_target_brand && (
                      <span className="text-[9px] font-[family-name:var(--font-mono)] font-500 px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent-wash)]">
                        TARGET
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-[13px] font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">
                  {c.mention_count}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[var(--color-surface-alt)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                        style={{ width: `${Math.min(c.share_of_voice, 100)}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">
                      {c.share_of_voice.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-[13px] font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)]">
                  #{c.average_position.toFixed(1)}
                </td>
                <td className="px-6 py-3.5">
                  <MiniSentiment breakdown={c.sentiment_breakdown} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortTh({
  label, field, current, asc, onSort,
}: {
  label: string; field: SortKey; current: SortKey; asc: boolean;
  onSort: (k: SortKey) => void;
}) {
  const isActive = current === field;
  return (
    <th
      className="text-left px-6 py-3 text-[11px] font-500 text-[var(--color-ink-muted)] cursor-pointer hover:text-[var(--color-ink)] select-none transition-colors"
      onClick={() => onSort(field)}
    >
      {label}
      {isActive && (
        <span className="ml-1 text-[var(--color-accent)]">{asc ? "\u2191" : "\u2193"}</span>
      )}
    </th>
  );
}

function MiniSentiment({ breakdown }: { breakdown: { positive: number; neutral: number; negative: number } }) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative;
  if (total === 0) return <span className="text-[11px] text-[var(--color-ink-faint)]">-</span>;
  return (
    <div className="flex h-1.5 w-20 rounded-full overflow-hidden bg-[var(--color-surface-alt)]">
      {breakdown.positive > 0 && <div className="bg-[var(--color-success)]" style={{ width: `${(breakdown.positive / total) * 100}%` }} />}
      {breakdown.neutral > 0 && <div className="bg-[var(--color-warning)]" style={{ width: `${(breakdown.neutral / total) * 100}%` }} />}
      {breakdown.negative > 0 && <div className="bg-[var(--color-danger)]" style={{ width: `${(breakdown.negative / total) * 100}%` }} />}
    </div>
  );
}
