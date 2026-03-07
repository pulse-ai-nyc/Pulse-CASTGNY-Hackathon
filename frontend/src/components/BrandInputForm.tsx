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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Brand Name
        </label>
        <input
          id="brand"
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="e.g. Rhode, Notion, Stripe"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Website URL
        </label>
        <input
          id="website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="e.g. https://www.rhodeskin.com/"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !brandName.trim() || !websiteUrl.trim()}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? "Analyzing..." : "Analyze Brand Visibility"}
      </button>
    </form>
  );
}
