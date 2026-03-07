import json
import logging

from app.models.metrics import CompetitorEntry, SoMMetrics
from app.models.report import ContentArtifact
from app.services import anthropic_client

logger = logging.getLogger(__name__)


async def generate_artifacts(
    brand_name: str,
    category: str,
    metrics: SoMMetrics,
    competitors: list[CompetitorEntry],
) -> list[ContentArtifact]:
    top_competitors = [c.brand_name for c in competitors[:5] if not c.is_target_brand]
    comp_list = ", ".join(top_competitors) if top_competitors else "competitors"

    prompt = f"""Generate 4 content artifacts for the brand "{brand_name}" in the "{category}" category to improve their AI visibility.

Current Share of Model: {metrics.share_of_model}%
Top competitors: {comp_list}

Generate these 4 artifacts as a JSON array:

1. Wikipedia-style summary: A neutral, factual encyclopedia-style description of {brand_name}
2. Comparison page: {brand_name} vs {comp_list} — structured comparison with key differentiators
3. FAQ content: 5-7 Q&A pairs matching high-intent queries about {category}
4. Schema.org markup: JSON-LD structured data recommendation for {brand_name}'s website

Return ONLY this JSON array:
[
  {{"type": "wikipedia_summary", "title": "...", "content": "..."}},
  {{"type": "comparison_page", "title": "...", "content": "..."}},
  {{"type": "faq_content", "title": "...", "content": "..."}},
  {{"type": "schema_markup", "title": "...", "content": "..."}}
]

Use markdown formatting in the content fields."""

    response = await anthropic_client.query(prompt, max_tokens=4096)

    if response.startswith("Error:"):
        logger.error(f"Claude returned error for content generation: {response}")
        return []

    try:
        start = response.index("[")
        end = response.rindex("]") + 1
        parsed = json.loads(response[start:end])
        return [ContentArtifact(**a) for a in parsed]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse content artifacts: {e}")
        return []
