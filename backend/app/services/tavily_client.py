import logging

from tavily import AsyncTavilyClient

from app.config import settings

logger = logging.getLogger(__name__)

_client: AsyncTavilyClient | None = None


def _get_client() -> AsyncTavilyClient:
    global _client
    if _client is None:
        _client = AsyncTavilyClient(api_key=settings.tavily_api_key)
    return _client


async def search(query: str, max_results: int = 5) -> dict:
    try:
        client = _get_client()
        response = await client.search(
            query=query,
            max_results=max_results,
            include_answer=True,
        )
        return response
    except Exception as e:
        logger.error(f"Tavily search error: {e}")
        return {"answer": "", "results": [], "error": str(e)}


async def extract(url: str) -> dict:
    try:
        client = _get_client()
        response = await client.extract(urls=[url])
        return response
    except Exception as e:
        logger.error(f"Tavily extract error: {e}")
        return {"results": [], "error": str(e)}
