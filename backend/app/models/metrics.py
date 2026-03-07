from typing import Literal

from pydantic import BaseModel


class BrandMention(BaseModel):
    brand_name: str
    position: int
    sentiment: Literal["positive", "neutral", "negative"]
    context_snippet: str


class QueryResult(BaseModel):
    query: str
    source: Literal["tavily", "claude"]
    response_text: str
    cited_urls: list[str] = []
    brands_mentioned: list[BrandMention] = []


class SoMMetrics(BaseModel):
    share_of_model: float
    total_queries: int
    queries_with_brand: int
    average_position: float | None = None
    citation_presence: float


class SentimentBreakdown(BaseModel):
    positive: int = 0
    neutral: int = 0
    negative: int = 0


class CompetitorEntry(BaseModel):
    brand_name: str
    mention_count: int
    share_of_voice: float
    average_position: float
    sentiment_breakdown: SentimentBreakdown
    is_target_brand: bool = False
