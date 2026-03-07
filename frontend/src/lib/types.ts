export interface AnalysisRequest {
  brand_name: string;
  website_url: string;
  customer_segment?: string;
}

export interface BrandProfileEvent {
  category: string;
  description: string;
  key_products: string[];
}

export interface BrandMention {
  brand_name: string;
  position: number;
  sentiment: "positive" | "neutral" | "negative";
  context_snippet: string;
}

export interface QueryResult {
  query: string;
  source: "tavily" | "claude";
  response_text: string;
  cited_urls: string[];
  brands_mentioned: BrandMention[];
}

export interface SoMMetrics {
  share_of_model: number;
  total_queries: number;
  queries_with_brand: number;
  average_position: number | null;
  citation_presence: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface CompetitorEntry {
  brand_name: string;
  mention_count: number;
  share_of_voice: number;
  average_position: number;
  sentiment_breakdown: SentimentBreakdown;
  is_target_brand: boolean;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: string;
  action_steps: string[];
}

export interface ContentArtifact {
  type:
    | "wikipedia_summary"
    | "comparison_page"
    | "faq_content"
    | "schema_markup"
    | "answer_ready_snippets"
    | "keyword_alignment";
  title: string;
  content: string;
}

export interface GEOReport {
  id: string;
  brand_name: string;
  category: string;
  created_at: string;
  metrics: SoMMetrics;
  competitors: CompetitorEntry[];
  evidence: QueryResult[];
  recommendations: Recommendation[];
  content_artifacts: ContentArtifact[];
  analysis_narrative: string;
}

export interface PhaseEvent {
  name: string;
  step: number;
  total: number;
}

export interface SourceResultEvent {
  query: string;
  source: "tavily" | "claude";
  status: string;
}
