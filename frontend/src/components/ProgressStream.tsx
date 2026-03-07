"use client";

import type { PhaseEvent, SourceResultEvent } from "@/lib/types";

interface Props {
  phase: PhaseEvent | null;
  queries: string[];
  sourceResults: SourceResultEvent[];
  status: "idle" | "running" | "complete" | "error";
}

const PHASE_NAMES = [
  "Discovering brand",
  "Generating queries",
  "Querying AI sources",
  "Parsing responses",
  "Computing metrics",
  "AI analysis & recommendations",
  "Generating content",
];

export default function ProgressStream({
  phase,
  queries,
  sourceResults,
  status,
}: Props) {
  const currentStep = phase?.step ?? 0;

  return (
    <div className="w-full max-w-lg space-y-3">
      {PHASE_NAMES.map((name, i) => {
        const step = i + 1;
        const isActive = currentStep === step && status === "running";
        const isComplete = currentStep > step || status === "complete";

        return (
          <div key={name} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                  isComplete
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : isActive
                    ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse"
                    : "bg-zinc-800 border-zinc-700 text-zinc-500"
                }`}
              >
                {isComplete ? "\u2713" : step}
              </div>
              {step < 7 && (
                <div
                  className={`w-0.5 h-6 ${
                    isComplete ? "bg-green-500/40" : "bg-zinc-700"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-sm font-medium ${
                  isComplete
                    ? "text-green-400"
                    : isActive
                    ? "text-blue-400"
                    : "text-zinc-500"
                }`}
              >
                {name}
              </p>
              {isActive && step === 2 && queries.length > 0 && (
                <p className="text-xs text-zinc-500 mt-1">
                  {queries.length} queries generated
                </p>
              )}
              {isActive && step === 3 && (
                <p className="text-xs text-zinc-500 mt-1">
                  {sourceResults.length} responses received
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
