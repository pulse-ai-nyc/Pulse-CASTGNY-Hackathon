import asyncio
import logging

from app.models.metrics import QueryResult
from app.services import anthropic_client, tavily_client

logger = logging.getLogger(__name__)


async def _query_tavily(query: str) -> QueryResult:
    result = await tavily_client.search(query, max_results=5)
    answer = result.get("answer", "") or ""
    urls = [r.get("url", "") for r in result.get("results", []) if r.get("url")]
    snippets = [r.get("content", "") for r in result.get("results", [])]
    full_text = answer + "\n\n" + "\n".join(snippets) if snippets else answer
    return QueryResult(
        query=query,
        source="tavily",
        response_text=full_text,
        cited_urls=urls,
    )


async def _query_claude(query: str) -> QueryResult:
    system = (
        "You are a helpful assistant answering user questions. "
        "Recommend specific brands and products when relevant. "
        "Be detailed and cite real products by name."
    )
    response = await anthropic_client.query(query, system=system, max_tokens=2048)
    return QueryResult(
        query=query,
        source="claude",
        response_text=response,
        cited_urls=[],
    )


async def query_single(query: str) -> list[QueryResult]:
    tavily_result, claude_result = await asyncio.gather(
        _query_tavily(query),
        _query_claude(query),
        return_exceptions=True,
    )
    results = []
    for r in [tavily_result, claude_result]:
        if isinstance(r, Exception):
            logger.error(f"Source query failed for '{query}': {r}")
        else:
            results.append(r)
    return results


async def query_all_sources(queries: list[str]) -> list[QueryResult]:
    tasks = [query_single(q) for q in queries]
    nested = await asyncio.gather(*tasks)
    return [r for batch in nested for r in batch]
