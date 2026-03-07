"use client";

import { useState } from "react";
import type { ContentArtifact } from "@/lib/types";

interface Props {
  artifacts: ContentArtifact[];
}

const TAB_LABELS: Record<ContentArtifact["type"], string> = {
  wikipedia_summary: "Wikipedia Draft",
  comparison_page: "Comparison",
  faq_content: "FAQ Content",
  schema_markup: "Schema.org",
  answer_ready_snippets: "Answer Snippets",
  keyword_alignment: "Keyword Alignment",
};

const TAB_ICONS: Record<ContentArtifact["type"], string> = {
  wikipedia_summary: "W",
  comparison_page: "C",
  faq_content: "Q",
  schema_markup: "{ }",
  answer_ready_snippets: "A",
  keyword_alignment: "K",
};

export default function ContentArtifacts({ artifacts }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (artifacts.length === 0) return null;
  const active = artifacts[activeIdx];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <p className="text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-ink-muted)]">
          Generated Content
        </p>
        <span className="text-[11px] text-[var(--color-ink-faint)]">
          {artifacts.length} artifacts
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto">
        {artifacts.map((a, i) => (
          <button
            key={a.type}
            onClick={() => { setActiveIdx(i); setCopied(false); }}
            className={`flex items-center gap-2 px-5 py-3 text-[12px] font-500 whitespace-nowrap transition-all border-b-2 ${
              i === activeIdx
                ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-light)]/30"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]"
            }`}
          >
            <span className={`w-5 h-5 rounded text-[9px] font-[family-name:var(--font-mono)] font-500 flex items-center justify-center ${
              i === activeIdx
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]"
            }`}>
              {TAB_ICONS[a.type]}
            </span>
            {TAB_LABELS[a.type]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[14px] font-600 text-[var(--color-ink)]">
            {active.title}
          </h4>
          <button
            onClick={handleCopy}
            className={`text-[11px] font-[family-name:var(--font-mono)] font-500 px-3 py-1.5 rounded-lg border transition-all ${
              copied
                ? "bg-[var(--color-success-light)] border-[var(--color-success-wash)] text-[var(--color-success)]"
                : "bg-[var(--color-surface-alt)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-5 max-h-[420px] overflow-y-auto">
          <pre className="text-[12px] font-[family-name:var(--font-mono)] text-[var(--color-ink-secondary)] whitespace-pre-wrap leading-relaxed">
            {active.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
