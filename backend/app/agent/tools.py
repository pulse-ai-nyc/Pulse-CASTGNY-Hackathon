import json
import logging
import re

import aiohttp

from app.services import tavily_client

logger = logging.getLogger(__name__)

TOOL_DEFINITIONS = [
    {
        "name": "tavily_search",
        "description": "Search the web using Tavily API. Returns search results with URLs, snippets, and an AI-generated answer.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Max results (default 5)", "default": 5},
            },
            "required": ["query"],
        },
    },
    {
        "name": "tavily_extract",
        "description": "Extract clean text content from a URL using Tavily.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to extract content from"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "check_website_schema",
        "description": "Fetch a webpage and check if it has Schema.org JSON-LD structured data markup.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to check for Schema.org markup"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "check_wikipedia_presence",
        "description": "Check if a brand has a Wikipedia article. Returns article summary or 'not found'.",
        "input_schema": {
            "type": "object",
            "properties": {
                "brand_name": {"type": "string", "description": "Brand name to search on Wikipedia"},
            },
            "required": ["brand_name"],
        },
    },
    {
        "name": "check_press_reviews",
        "description": "Search for recent press coverage, news articles, and review-site presence for a brand.",
        "input_schema": {
            "type": "object",
            "properties": {
                "brand_name": {"type": "string", "description": "Brand name to search press/reviews for"},
                "category": {"type": "string", "description": "Brand category for context"},
            },
            "required": ["brand_name"],
        },
    },
    {
        "name": "check_crawlability",
        "description": "Check if a URL returns clean, extractable text content (not JS-only or login-walled).",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to check crawlability for"},
            },
            "required": ["url"],
        },
    },
    {
        "name": "check_content_freshness",
        "description": "Check last-modified date and content recency signals for a URL.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to check freshness for"},
            },
            "required": ["url"],
        },
    },
]


async def execute_tool(name: str, input_data: dict) -> str:
    try:
        if name == "tavily_search":
            result = await tavily_client.search(
                input_data["query"],
                max_results=input_data.get("max_results", 5),
            )
            results = result.get("results", [])
            answer = result.get("answer", "")
            formatted = f"Answer: {answer}\n\nResults:\n"
            for r in results[:5]:
                formatted += f"- {r.get('title', '')}: {r.get('url', '')}\n  {r.get('content', '')[:200]}\n"
            return formatted

        elif name == "tavily_extract":
            result = await tavily_client.extract(input_data["url"])
            results = result.get("results", [])
            if results:
                return results[0].get("raw_content", "")[:3000]
            return "Could not extract content from URL."

        elif name == "check_website_schema":
            url = input_data["url"]
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    html = await resp.text()
            ld_json_blocks = re.findall(
                r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                html,
                re.DOTALL | re.IGNORECASE,
            )
            if ld_json_blocks:
                return f"Found {len(ld_json_blocks)} Schema.org JSON-LD block(s):\n" + "\n---\n".join(
                    block.strip()[:500] for block in ld_json_blocks
                )
            return "No Schema.org JSON-LD markup found on this page."

        elif name == "check_wikipedia_presence":
            brand = input_data["brand_name"]
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{brand.replace(' ', '_')}"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return f"Wikipedia article found: {data.get('title', '')}\n\n{data.get('extract', '')}"
                    return f"No Wikipedia article found for '{brand}'."

        elif name == "check_press_reviews":
            brand = input_data["brand_name"]
            category = input_data.get("category", "")
            # Search for press coverage
            press_result = await tavily_client.search(
                f'"{brand}" review OR press OR coverage OR news {category}',
                max_results=5,
            )
            # Search for review site presence
            review_result = await tavily_client.search(
                f'"{brand}" site:g2.com OR site:trustpilot.com OR site:capterra.com OR site:yelp.com',
                max_results=5,
            )
            formatted = "## Press & News Coverage:\n"
            for r in press_result.get("results", [])[:5]:
                formatted += f"- {r.get('title', '')}: {r.get('url', '')}\n  {r.get('content', '')[:150]}\n"
            formatted += "\n## Review Site Presence:\n"
            review_results = review_result.get("results", [])
            if review_results:
                for r in review_results[:5]:
                    formatted += f"- {r.get('title', '')}: {r.get('url', '')}\n"
            else:
                formatted += "- No review site profiles found.\n"
            return formatted

        elif name == "check_crawlability":
            url = input_data["url"]
            result = await tavily_client.extract(url)
            results = result.get("results", [])
            if results:
                content = results[0].get("raw_content", "")
                word_count = len(content.split())
                if word_count > 50:
                    return f"Crawlable: YES — extracted {word_count} words of clean text content."
                elif word_count > 0:
                    return f"Partially crawlable: Only {word_count} words extracted. Content may be JS-rendered or behind a wall."
                else:
                    return "NOT crawlable: No text content could be extracted. Likely JS-only or login-walled."
            return "NOT crawlable: Extraction failed entirely."

        elif name == "check_content_freshness":
            url = input_data["url"]
            headers_info = ""
            async with aiohttp.ClientSession() as session:
                async with session.head(url, timeout=aiohttp.ClientTimeout(total=10), allow_redirects=True) as resp:
                    last_modified = resp.headers.get("Last-Modified", "Not provided")
                    date = resp.headers.get("Date", "Not provided")
                    cache_control = resp.headers.get("Cache-Control", "Not provided")
                    headers_info = (
                        f"Last-Modified: {last_modified}\n"
                        f"Date: {date}\n"
                        f"Cache-Control: {cache_control}\n"
                    )
            # Also check page content for date signals
            extract_result = await tavily_client.extract(url)
            date_signals = ""
            if extract_result.get("results"):
                content = extract_result["results"][0].get("raw_content", "")[:2000]
                # Look for date patterns
                dates_found = re.findall(
                    r'(?:updated|published|modified|date)[:\s]*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\w+ \d{1,2},? \d{4})',
                    content, re.IGNORECASE
                )
                if dates_found:
                    date_signals = f"Dates found in content: {', '.join(dates_found[:5])}"
                else:
                    date_signals = "No publish/update dates found in page content."
            return f"HTTP Headers:\n{headers_info}\n{date_signals}"

        return f"Unknown tool: {name}"
    except Exception as e:
        logger.error(f"Tool execution error ({name}): {e}")
        return f"Tool error: {e}"
