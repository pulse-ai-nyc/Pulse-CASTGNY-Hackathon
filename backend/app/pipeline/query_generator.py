import json
import logging

from app.services import anthropic_client

logger = logging.getLogger(__name__)


async def generate_queries(
    brand_name: str,
    category: str,
    customer_segment: str | None = None,
    num_queries: int = 8,
) -> list[str]:
    segment_context = ""
    if customer_segment:
        segment_context = f" targeting {customer_segment}"

    prompt = f"""Generate exactly {num_queries} high-intent search queries that a potential customer would ask an AI assistant when looking for products/services in the "{category}" category{segment_context}.

These queries should be the type where AI assistants would recommend specific brands. Mix these types:
- "Best [category] for [use case]" queries
- "Compare [category] options" queries
- "[category] recommendations for [scenario]" queries
- "What [category] should I use for [task]" queries

The brand "{brand_name}" operates in this category but DO NOT include the brand name in the queries — we want to see if AI mentions it organically.

Return ONLY a JSON array of strings, no other text:
["query 1", "query 2", ...]"""

    response = await anthropic_client.query(prompt, max_tokens=1024)

    try:
        start = response.index("[")
        end = response.rindex("]") + 1
        queries = json.loads(response[start:end])
        return queries[:num_queries]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse queries: {e}")
        return [
            f"best {category} tools",
            f"top {category} software",
            f"recommended {category} for businesses",
            f"{category} comparison",
            f"which {category} should I use",
        ]
