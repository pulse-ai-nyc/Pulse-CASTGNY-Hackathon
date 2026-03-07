"use client";

import { useState } from "react";
import type { QueryResult } from "@/lib/types";

interface Props {
  evidence: QueryResult[];
}

export default function EvidencePanel({ evidence }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <h3 className="text-sm font-medium text-zinc-400 px-6 py-4 border-b border-zinc-800">
        Evidence ({evidence.length} responses)
      </h3>
      <div className="divide-y divide-zinc-800">
        {evidence.map((e, i) => (
          <div key={`${e.query}-${e.source}-${i}`}>
            <button
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    e.source === "tavily"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {e.source}
                </span>
                <span className="text-sm text-zinc-300 truncate">
                  {e.query}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs text-zinc-500">
                  {e.brands_mentioned.length} brands
                </span>
                <span className="text-zinc-600">
                  {expandedIdx === i ? "\u25B2" : "\u25BC"}
                </span>
              </div>
            </button>
            {expandedIdx === i && (
              <div className="px-6 pb-4 space-y-3">
                {e.brands_mentioned.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Brands Mentioned
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {e.brands_mentioned.map((m, j) => (
                        <span
                          key={j}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            m.sentiment === "positive"
                              ? "bg-green-500/10 text-green-400"
                              : m.sentiment === "negative"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          #{m.position} {m.brand_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {e.cited_urls.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">
                      Cited URLs
                    </p>
                    <div className="space-y-1">
                      {e.cited_urls.map((url, j) => (
                        <a
                          key={j}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-400 hover:text-blue-300 truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">
                    Response
                  </p>
                  <pre className="text-xs text-zinc-400 whitespace-pre-wrap max-h-48 overflow-y-auto bg-zinc-950 p-3 rounded-lg">
                    {e.response_text.slice(0, 1500)}
                    {e.response_text.length > 1500 && "..."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
