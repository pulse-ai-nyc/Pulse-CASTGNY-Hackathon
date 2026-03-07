import json
import logging

from pydantic import BaseModel

from app.services import anthropic_client, tavily_client

logger = logging.getLogger(__name__)


class BrandProfile(BaseModel):
    brand_name: str
    website_url: str
    category: str
    brand_description: str
    key_products: list[str]


async def discover_brand(brand_name: str, website_url: str) -> BrandProfile:
    # Step 1: Try to scrape the website
    scraped_content = ""
    extract_result = await tavily_client.extract(website_url)

    if extract_result.get("results"):
        scraped_content = extract_result["results"][0].get("raw_content", "")[:3000]

    # Step 2: Fallback to search if extract failed
    if not scraped_content:
        logger.info(f"Extract failed for {website_url}, falling back to search")
        search_result = await tavily_client.search(f"{brand_name} brand", max_results=3)
        if search_result.get("answer"):
            scraped_content = search_result["answer"]
        elif search_result.get("results"):
            scraped_content = "\n".join(
                r.get("content", "") for r in search_result["results"][:3]
            )[:3000]

    # Step 3: Ask Claude to infer category and details
    prompt = f"""Analyze this brand and its website content. Return ONLY a JSON object.

Brand name: {brand_name}
Website: {website_url}

Website content:
\"\"\"
{scraped_content or "No content available — infer from brand name and URL."}
\"\"\"

Return this exact JSON structure:
{{"category": "the industry/market category (e.g. Skincare & Beauty, CRM Software, Cloud Computing)", "brand_description": "1-2 sentence description of what this brand does", "key_products": ["product1", "product2", "product3"]}}"""

    response = await anthropic_client.query(prompt, max_tokens=512)

    try:
        start = response.index("{")
        end = response.rindex("}") + 1
        parsed = json.loads(response[start:end])
        return BrandProfile(
            brand_name=brand_name,
            website_url=website_url,
            category=parsed.get("category", "General"),
            brand_description=parsed.get("brand_description", ""),
            key_products=parsed.get("key_products", []),
        )
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse brand discovery response: {e}")
        return BrandProfile(
            brand_name=brand_name,
            website_url=website_url,
            category="General",
            brand_description="",
            key_products=[],
        )
