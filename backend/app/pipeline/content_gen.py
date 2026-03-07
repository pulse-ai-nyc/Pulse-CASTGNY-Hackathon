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

    prompt = f"""Generate 6 content artifacts for the brand "{brand_name}" in the "{category}" category to improve their AI visibility.

Current Share of Model: {metrics.share_of_model}%
Top competitors: {comp_list}

Generate these 6 artifacts as a JSON array:

1. Wikipedia-style summary (Tip 7 & 11): A neutral, factual encyclopedia-style description of {brand_name} suitable for Wikipedia. Include what it is, who it's for, key products, founding details if known. This helps AI models identify and describe the brand.

2. Comparison page (Tip 9): {brand_name} vs {comp_list} — structured comparison with features, pricing tiers, use cases, pros/cons. This content helps the brand appear in "best X" and "X vs Y" AI queries.

3. FAQ content (Tip 8): 7-10 Q&A pairs matching high-intent queries about {category}. Questions should use natural language people type into AI assistants. Answers should be concise, factual, and mention {brand_name} naturally.

4. Schema.org markup (Tip 6): Complete JSON-LD structured data for {brand_name}'s website including Organization, Product, FAQ, and Review schemas. This makes the brand machine-readable for AI models.

5. Answer-ready snippets (Tip 16): 5-7 short, direct answer paragraphs (2-3 sentences each) that {brand_name} can place at the top of key pages. Each snippet should directly answer a common question about {category} and naturally include {brand_name}. Format them so AI models can extract and quote them verbatim.

6. Keyword alignment recommendations (Tip 15): Analyze the gap between how users query AI about {category} and typical brand page language. Provide specific title tag, H1, and opening paragraph rewrites for {brand_name}'s key pages (homepage, product page, pricing page) that match natural query language.

Return ONLY this JSON array:
[
  {{"type": "wikipedia_summary", "title": "...", "content": "..."}},
  {{"type": "comparison_page", "title": "...", "content": "..."}},
  {{"type": "faq_content", "title": "...", "content": "..."}},
  {{"type": "schema_markup", "title": "...", "content": "..."}},
  {{"type": "answer_ready_snippets", "title": "...", "content": "..."}},
  {{"type": "keyword_alignment", "title": "...", "content": "..."}}
]

Use markdown formatting in the content fields."""

    response = await anthropic_client.query(prompt, max_tokens=8192)

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
