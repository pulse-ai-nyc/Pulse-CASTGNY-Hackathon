"use client";

import { useState } from "react";
import type { AnalysisRequest } from "@/lib/types";

interface Props {
  onSubmit: (request: AnalysisRequest) => void;
  isLoading: boolean;
}

const CATEGORY_SUGGESTIONS = [
  "CRM Software",
  "Project Management",
  "Cloud Computing",
  "E-commerce Platform",
  "Marketing Automation",
  "Cybersecurity",
  "Data Analytics",
  "HR Software",
  "Productivity Tools",
  "Video Conferencing",
];

export default function BrandInputForm({ onSubmit, isLoading }: Props) {
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !category.trim()) return;
    onSubmit({ brand_name: brandName.trim(), category: category.trim() });
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
          placeholder="e.g. Notion, Salesforce, Stripe"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Category
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Productivity Tools"
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_SUGGESTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !brandName.trim() || !category.trim()}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? "Analyzing..." : "Analyze Brand Visibility"}
      </button>
    </form>
  );
}
