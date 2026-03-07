"use client";

import type { PhaseEvent, SourceResultEvent } from "@/lib/types";

interface Props {
  phase: PhaseEvent | null;
  queries: string[];
  sourceResults: SourceResultEvent[];
  status: "idle" | "running" | "complete" | "error";
}

const PHASES = [
  { name: "Discovering brand", icon: "1" },
  { name: "Generating queries", icon: "2" },
  { name: "Querying AI sources", icon: "3" },
  { name: "Parsing responses", icon: "4" },
  { name: "Computing metrics", icon: "5" },
  { name: "AI analysis", icon: "6" },
  { name: "Generating content", icon: "7" },
];

export default function ProgressStream({
  phase,
  queries,
  sourceResults,
  status,
}: Props) {
  const currentStep = phase?.step ?? 0;

  return (
    <div className="w-full max-w-lg">
      <div className="space-y-1">
        {PHASES.map(({ name, icon }, i) => {
          const step = i + 1;
          const isActive = currentStep === step && status === "running";
          const isComplete = currentStep > step || status === "complete";
          const isPending = !isActive && !isComplete;

          return (
            <div
              key={name}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-[var(--color-accent-light)] border border-[var(--color-accent-wash)]"
                  : isComplete
                  ? "bg-[var(--color-success-light)]"
                  : "bg-transparent"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-[family-name:var(--font-mono)] font-500 shrink-0 transition-all ${
                  isComplete
                    ? "bg-[var(--color-success)] text-white"
                    : isActive
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)] border border-[var(--color-border)]"
                }`}
              >
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  icon
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-500 transition-colors ${
                    isComplete
                      ? "text-[var(--color-success)]"
                      : isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-ink-muted)]"
                  }`}
                >
                  {name}
                </p>
                {isActive && step === 2 && queries.length > 0 && (
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                    {queries.length} queries generated
                  </p>
                )}
                {isActive && step === 3 && (
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                    {sourceResults.length} responses received
                  </p>
                )}
              </div>

              {isActive && (
                <div className="w-16 h-1 rounded-full bg-[var(--color-accent-wash)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ animation: "scan 1.5s ease-in-out infinite" }}
                  />
                </div>
              )}

              {isPending && (
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-ink-faint)]">
                  pending
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
