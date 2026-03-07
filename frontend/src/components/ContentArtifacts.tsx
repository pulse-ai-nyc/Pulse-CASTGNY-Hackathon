"use client";

import { useState } from "react";
import type { ContentArtifact } from "@/lib/types";

interface Props {
  artifacts: ContentArtifact[];
}

const TAB_LABELS: Record<ContentArtifact["type"], string> = {
  wikipedia_summary: "Wikipedia Draft",
  comparison_page: "Comparison Page",
  faq_content: "FAQ Content",
  schema_markup: "Schema.org",
};

export default function ContentArtifacts({ artifacts }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (artifacts.length === 0) return null;

  const active = artifacts[activeIdx];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        {artifacts.map((a, i) => (
          <button
            key={a.type}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              i === activeIdx
                ? "text-blue-400 border-b-2 border-blue-400 bg-zinc-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {TAB_LABELS[a.type] || a.type}
          </button>
        ))}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">{active.title}</h4>
          <button
            onClick={() => navigator.clipboard.writeText(active.content)}
            className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-zinc-950 p-4 rounded-lg max-h-96 overflow-y-auto">
          {active.content}
        </pre>
      </div>
    </div>
  );
}
