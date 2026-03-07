from typing import Literal

from pydantic import BaseModel

from app.models.metrics import CompetitorEntry, QueryResult, SoMMetrics


class Recommendation(BaseModel):
    title: str
    description: str
    impact: Literal["high", "medium", "low"]
    effort: Literal["high", "medium", "low"]
    category: str
    action_steps: list[str]


class ContentArtifact(BaseModel):
    type: Literal[
        "wikipedia_summary",
        "comparison_page",
        "faq_content",
        "schema_markup",
        "answer_ready_snippets",
        "keyword_alignment",
    ]
    title: str
    content: str


class GEOReport(BaseModel):
    id: str
    brand_name: str
    category: str
    created_at: str
    metrics: SoMMetrics
    competitors: list[CompetitorEntry]
    evidence: list[QueryResult]
    recommendations: list[Recommendation]
    content_artifacts: list[ContentArtifact]
    analysis_narrative: str
