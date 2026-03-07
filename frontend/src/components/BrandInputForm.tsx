"use client";

import { useState } from "react";
import type { AnalysisRequest } from "@/lib/types";

interface Props {
  onSubmit: (request: AnalysisRequest) => void;
  isLoading: boolean;
}

export default function BrandInputForm({ onSubmit, isLoading }: Props) {
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !websiteUrl.trim()) return;
    onSubmit({ brand_name: brandName.trim(), website_url: websiteUrl.trim() });
  };

  const ready = brandName.trim() && websiteUrl.trim() && !isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="card p-1.5 flex flex-col sm:flex-row gap-1.5">
        <div className="flex-1 relative">
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            className="w-full h-12 px-4 bg-[var(--color-surface-alt)] rounded-lg text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-white transition-all"
            disabled={isLoading}
            required
          />
        </div>
        <div className="flex-1 relative">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full h-12 px-4 bg-[var(--color-surface-alt)] rounded-lg text-[15px] text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-white transition-all font-[family-name:var(--font-mono)] text-[13px]"
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!ready}
          className="h-12 px-7 rounded-lg font-[family-name:var(--font-display)] font-600 text-[14px] tracking-tight transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
    </form>
  );
}
