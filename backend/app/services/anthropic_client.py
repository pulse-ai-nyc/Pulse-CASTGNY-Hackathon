import logging

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

_client: anthropic.AsyncAnthropic | None = None

MODEL = "claude-sonnet-4-20250514"


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def query(prompt: str, system: str = "", max_tokens: int = 4096) -> str:
    try:
        client = _get_client()
        messages = [{"role": "user", "content": prompt}]
        kwargs: dict = {
            "model": MODEL,
            "max_tokens": max_tokens,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system
        response = await client.messages.create(**kwargs)
        return response.content[0].text
    except Exception as e:
        logger.error(f"Anthropic query error: {e}")
        return f"Error: {e}"


async def query_with_tools(
    messages: list[dict],
    system: str,
    tools: list[dict],
    max_tokens: int = 4096,
) -> anthropic.types.Message:
    client = _get_client()
    return await client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=messages,
        tools=tools,
    )
