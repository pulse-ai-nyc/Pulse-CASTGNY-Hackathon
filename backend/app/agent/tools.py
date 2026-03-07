import logging

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
            import re
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

        return f"Unknown tool: {name}"
    except Exception as e:
        logger.error(f"Tool execution error ({name}): {e}")
        return f"Tool error: {e}"
