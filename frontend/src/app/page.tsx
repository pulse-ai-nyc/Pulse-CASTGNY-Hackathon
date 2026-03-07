"use client";

import BrandInputForm from "@/components/BrandInputForm";
import ProgressStream from "@/components/ProgressStream";
import ScoreGauge from "@/components/ScoreGauge";
import CompetitorTable from "@/components/CompetitorTable";
import SentimentChart from "@/components/SentimentChart";
import EvidencePanel from "@/components/EvidencePanel";
import ActionPlan from "@/components/ActionPlan";
import ContentArtifacts from "@/components/ContentArtifacts";
import { useAnalysis } from "@/hooks/useAnalysis";

export default function Home() {
  const { state, startAnalysis } = useAnalysis();
  const isRunning = state.status === "running";
  const hasResults = state.metrics !== null;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              G
            </div>
            <span className="text-lg font-semibold text-white">GEO Agent</span>
          </div>
          <span className="text-xs text-zinc-500">
            Generative Engine Optimization
          </span>
        </div>
      </header>

      {/* Hero / Input */}
      {!hasResults && !isRunning && (
        <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Measure Your Brand&apos;s AI Visibility
          </h1>
          <p className="text-zinc-400 max-w-md mb-10">
            Discover how often AI systems mention your brand, analyze
            competitors, and get actionable optimization recommendations.
          </p>
          <BrandInputForm onSubmit={startAnalysis} isLoading={isRunning} />
        </section>
      )}

      {/* Progress */}
      {isRunning && (
        <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-6">
            Analyzing...
          </h2>
          <ProgressStream
            phase={state.phase}
            queries={state.queries}
            sourceResults={state.sourceResults}
            status={state.status}
          />
        </section>
      )}

      {/* Results */}
      {hasResults && (
        <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Results for{" "}
              <span className="text-blue-400">
                {state.report?.brand_name || "brand"}
              </span>
              {state.brandProfile?.category && (
                <span className="text-sm font-normal text-zinc-400 ml-2">
                  in {state.brandProfile.category}
                </span>
              )}
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              New Analysis
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.metrics && <ScoreGauge metrics={state.metrics} />}
            {state.competitors.length > 0 && (
              <SentimentChart competitors={state.competitors} />
            )}
          </div>

          {state.competitors.length > 0 && (
            <CompetitorTable competitors={state.competitors} />
          )}

          {state.recommendations.length > 0 && (
            <ActionPlan recommendations={state.recommendations} />
          )}

          {state.contentArtifacts.length > 0 && (
            <ContentArtifacts artifacts={state.contentArtifacts} />
          )}

          {state.report?.evidence && state.report.evidence.length > 0 && (
            <EvidencePanel evidence={state.report.evidence} />
          )}
        </section>
      )}

      {/* Error */}
      {state.status === "error" && (
        <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-lg text-center">
            <h3 className="text-red-400 font-medium mb-2">Analysis Error</h3>
            <p className="text-sm text-zinc-400">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-xs px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              Try Again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
