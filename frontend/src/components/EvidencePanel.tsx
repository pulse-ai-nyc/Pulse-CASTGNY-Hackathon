"use client";

import { useState } from "react";
import type { QueryResult } from "@/lib/types";

interface Props {
  evidence: QueryResult[];
}

export default function EvidencePanel({ evidence }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)]">
          Evidence
        </p>
        <span className="text-[11px] text-[var(--color-ink-faint)]">
          {evidence.length} responses
        </span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {evidence.map((e, i) => (
          <div key={`${e.query}-${e.source}-${i}`}>
            <button
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-[var(--color-surface-alt)]/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-[9px] font-[family-name:var(--font-mono)] font-500 px-2 py-0.5 rounded border ${
                    e.source === "tavily"
                      ? "bg-[#f5f3ff] text-[#7c3aed] border-[#ede9fe]"
                      : "bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]"
                  }`}
                >
                  {e.source}
                </span>
                <span className="text-[13px] text-[var(--color-ink)] truncate">
                  {e.query}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-ink-faint)]">
                  {e.brands_mentioned.length} brands
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  className={`text-[var(--color-ink-faint)] transition-transform ${
                    expandedIdx === i ? "rotate-180" : ""
                  }`}
                >
                  <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </button>

            {expandedIdx === i && (
              <div className="px-6 pb-5 space-y-4 anim-in">
                {e.brands_mentioned.length > 0 && (
                  <div>
                    <p className="text-[10px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)] mb-2">
                      Brands mentioned
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {e.brands_mentioned.map((m, j) => (
                        <span
                          key={j}
                          className={`text-[11px] font-500 px-2.5 py-1 rounded-full border ${
                            m.sentiment === "positive"
                              ? "bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-wash)]"
                              : m.sentiment === "negative"
                              ? "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-wash)]"
                              : "bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] border-[var(--color-border)]"
                          }`}
                        >
                          <span className="font-[family-name:var(--font-mono)] text-[10px] opacity-60">#{m.position}</span>{" "}
                          {m.brand_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {e.cited_urls.length > 0 && (
                  <div>
                    <p className="text-[10px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)] mb-2">
                      Cited URLs
                    </p>
                    <div className="space-y-1">
                      {e.cited_urls.map((url, j) => (
                        <a
                          key={j}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[12px] font-[family-name:var(--font-mono)] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] truncate transition-colors"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)] mb-2">
                    Response
                  </p>
                  <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 max-h-52 overflow-y-auto">
                    <pre className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)] whitespace-pre-wrap leading-relaxed">
                      {e.response_text.slice(0, 1500)}
                      {e.response_text.length > 1500 && "..."}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
