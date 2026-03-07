import json
import logging

from app.models.metrics import BrandMention, QueryResult
from app.services import anthropic_client

logger = logging.getLogger(__name__)


async def parse_response(result: QueryResult, target_brand: str) -> list[BrandMention]:
    if not result.response_text.strip():
        return []

    prompt = f"""Analyze this AI-generated response and extract ALL brand/product mentions.

Response text:
\"\"\"
{result.response_text[:3000]}
\"\"\"

Target brand to watch for: "{target_brand}"

For each brand mentioned, extract:
- brand_name: the exact brand/product name
- position: order of appearance (1 = first mentioned, 2 = second, etc.)
- sentiment: "positive", "neutral", or "negative" based on context
- context_snippet: the sentence or phrase where the brand is mentioned

Return ONLY a JSON array (empty array if no brands found):
[{{"brand_name": "...", "position": 1, "sentiment": "positive", "context_snippet": "..."}}]"""

    response = await anthropic_client.query(prompt, max_tokens=2048)

    if response.startswith("Error:"):
        logger.error(f"Claude returned error for parsing: {response}")
        return []

    try:
        start = response.index("[")
        end = response.rindex("]") + 1
        parsed = json.loads(response[start:end])
        return [BrandMention(**m) for m in parsed]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse mentions: {e}")
        return []


async def parse_all_results(
    results: list[QueryResult], target_brand: str
) -> list[QueryResult]:
    import asyncio

    async def _parse_one(result: QueryResult) -> QueryResult:
        mentions = await parse_response(result, target_brand)
        result.brands_mentioned = mentions
        return result

    parsed = await asyncio.gather(*[_parse_one(r) for r in results])
    return list(parsed)
