"use client";

import { useState, useCallback, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
import type {
  AnalysisRequest,
  PhaseEvent,
  BrandProfileEvent,
  SoMMetrics,
  CompetitorEntry,
  Recommendation,
  ContentArtifact,
  GEOReport,
  SourceResultEvent,
} from "@/lib/types";

export interface AnalysisState {
  status: "idle" | "running" | "complete" | "error";
  phase: PhaseEvent | null;
  brandProfile: BrandProfileEvent | null;
  queries: string[];
  sourceResults: SourceResultEvent[];
  metrics: SoMMetrics | null;
  competitors: CompetitorEntry[];
  analysisText: string;
  recommendations: Recommendation[];
  contentArtifacts: ContentArtifact[];
  report: GEOReport | null;
  error: string | null;
}

const initialState: AnalysisState = {
  status: "idle",
  phase: null,
  brandProfile: null,
  queries: [],
  sourceResults: [],
  metrics: null,
  competitors: [],
  analysisText: "",
  recommendations: [],
  contentArtifacts: [],
  report: null,
  error: null,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const startAnalysis = useCallback(async (request: AnalysisRequest) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...initialState, status: "running" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              handleEvent(currentEvent, data, setState);
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  const cancelAnalysis = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, status: "idle" }));
  }, []);

  return { state, startAnalysis, cancelAnalysis };
}

function handleEvent(
  event: string,
  data: Record<string, unknown>,
  setState: React.Dispatch<React.SetStateAction<AnalysisState>>
) {
  switch (event) {
    case "phase":
      setState((prev) => ({ ...prev, phase: data as unknown as PhaseEvent }));
      break;
    case "brand_profile":
      setState((prev) => ({
        ...prev,
        brandProfile: data as unknown as BrandProfileEvent,
      }));
      break;
    case "queries":
      setState((prev) => ({
        ...prev,
        queries: data.queries as string[],
      }));
      break;
    case "source_result":
      setState((prev) => ({
        ...prev,
        sourceResults: [
          ...prev.sourceResults,
          data as unknown as SourceResultEvent,
        ],
      }));
      break;
    case "metrics":
      setState((prev) => ({
        ...prev,
        metrics: data as unknown as SoMMetrics,
      }));
      break;
    case "competitor":
      setState((prev) => ({
        ...prev,
        competitors: [
          ...prev.competitors,
          data as unknown as CompetitorEntry,
        ],
      }));
      break;
    case "analysis_chunk":
      setState((prev) => ({
        ...prev,
        analysisText: prev.analysisText + (data.text as string),
      }));
      break;
    case "recommendation":
      setState((prev) => ({
        ...prev,
        recommendations: [
          ...prev.recommendations,
          data as unknown as Recommendation,
        ],
      }));
      break;
    case "content":
      setState((prev) => ({
        ...prev,
        contentArtifacts: [
          ...prev.contentArtifacts,
          data as unknown as ContentArtifact,
        ],
      }));
      break;
    case "complete":
      setState((prev) => ({
        ...prev,
        status: "complete",
        report: data as unknown as GEOReport,
      }));
      break;
    case "error":
      setState((prev) => ({
        ...prev,
        status: "error",
        error: data.message as string,
      }));
      break;
  }
}
