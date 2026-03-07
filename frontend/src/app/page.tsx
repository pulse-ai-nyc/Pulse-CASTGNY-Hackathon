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
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect width="26" height="26" rx="6" fill="var(--color-accent)" />
              <path d="M8 13.5C8 10.5 10.5 8 13.5 8C16.5 8 18.5 10 18.5 12.5C18.5 15 16.5 17 14 17H12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="10.5" cy="17.5" r="1.5" fill="white" />
            </svg>
            <span className="font-[family-name:var(--font-display)] text-[15px] font-700 text-[var(--color-ink)] tracking-tight">
              GEO Agent
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-[family-name:var(--font-mono)] tracking-wider text-[var(--color-ink-muted)] uppercase">
              Share of Model Intelligence
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      {!hasResults && !isRunning && (
        <section className="relative overflow-hidden">
          {/* Gradient orb */}
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, rgba(167,139,250,0.08) 40%, transparent 70%)",
          }} />

          <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 flex flex-col items-center text-center">
            <div className="anim-up">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-mono)] font-500 tracking-wider uppercase text-[var(--color-accent)] bg-[var(--color-accent-light)] px-3 py-1.5 rounded-full border border-[var(--color-accent-wash)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                Live Analysis
              </span>
            </div>

            <h1 className="anim-up d1 mt-8 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5.5vw,4.2rem)] font-800 text-[var(--color-ink)] leading-[1.08] tracking-tight max-w-2xl">
              Measure your brand&apos;s
              AI visibility
            </h1>

            <p className="anim-up d2 mt-5 text-[17px] text-[var(--color-ink-secondary)] leading-relaxed max-w-lg">
              See how often AI systems recommend your brand. Benchmark against competitors. Get an actionable optimization plan.
            </p>

            <div className="anim-up d3 mt-12 w-full max-w-md">
              <BrandInputForm onSubmit={startAnalysis} isLoading={isRunning} />
            </div>

            {/* Trust line */}
            <p className="anim-up d4 mt-8 text-[11px] text-[var(--color-ink-faint)] font-[family-name:var(--font-mono)] tracking-wide">
              Queries Tavily + Claude in real-time across 16 optimization levers
            </p>
          </div>
        </section>
      )}

      {/* Progress */}
      {isRunning && (
        <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-700 text-[var(--color-ink)] tracking-tight">
              Analyzing your brand
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Querying live AI sources and computing metrics...
            </p>
          </div>
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
        <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* Results Header */}
          <div className="anim-up flex items-end justify-between pb-6 border-b border-[var(--color-border)]">
            <div>
              <p className="text-[10px] font-[family-name:var(--font-mono)] tracking-wider uppercase text-[var(--color-ink-muted)] mb-1.5">
                Analysis Complete
              </p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-800 text-[var(--color-ink)] tracking-tight">
                {state.report?.brand_name || "Brand"}
                {state.brandProfile?.category && (
                  <span className="ml-3 text-lg font-400 text-[var(--color-ink-muted)]">
                    {state.brandProfile.category}
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-[12px] font-500 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-alt)] transition-all"
            >
              New analysis
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {state.metrics && (
              <div className="lg:col-span-2 anim-up d1">
                <ScoreGauge metrics={state.metrics} />
              </div>
            )}
            {state.competitors.length > 0 && (
              <div className="lg:col-span-3 anim-up d2">
                <SentimentChart competitors={state.competitors} />
              </div>
            )}
          </div>

          {state.competitors.length > 0 && (
            <div className="anim-up d3">
              <CompetitorTable competitors={state.competitors} />
            </div>
          )}

          {state.recommendations.length > 0 && (
            <div className="anim-up d4">
              <ActionPlan recommendations={state.recommendations} />
            </div>
          )}

          {state.contentArtifacts.length > 0 && (
            <div className="anim-up d5">
              <ContentArtifacts artifacts={state.contentArtifacts} />
            </div>
          )}

          {state.report?.evidence && state.report.evidence.length > 0 && (
            <div className="anim-up d6">
              <EvidencePanel evidence={state.report.evidence} />
            </div>
          )}

          <div className="h-16" />
        </section>
      )}

      {/* Error */}
      {state.status === "error" && (
        <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
          <div className="card p-8 max-w-md text-center border-[var(--color-danger-wash)]">
            <div className="w-10 h-10 rounded-full bg-[var(--color-danger-light)] flex items-center justify-center mx-auto mb-4">
              <span className="text-[var(--color-danger)] text-sm font-600">!</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-600 text-[var(--color-ink)] mb-2">
              Analysis failed
            </h3>
            <p className="text-sm text-[var(--color-ink-secondary)] mb-5">
              {state.error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[12px] font-500 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] transition-all"
            >
              Try again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
