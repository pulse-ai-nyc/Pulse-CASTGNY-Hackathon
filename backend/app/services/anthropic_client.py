import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "anthropic/claude-opus-4.6"


async def query(prompt: str, system: str = "", max_tokens: int = 4096) -> str:
    messages: list[dict] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "max_tokens": max_tokens,
                    "messages": messages,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["choices"][0]["message"]["content"]
        if not text:
            logger.error("OpenRouter returned empty response")
            return "Error: OpenRouter returned empty response"
        return text
    except httpx.TimeoutException:
        logger.error("OpenRouter request timed out")
        return "Error: OpenRouter request timed out"
    except httpx.HTTPStatusError as e:
        logger.error(f"OpenRouter HTTP error {e.response.status_code}: {e.response.text}")
        return f"Error: OpenRouter HTTP {e.response.status_code}"
    except Exception as e:
        logger.error(f"OpenRouter query error: {e}")
        return f"Error: {e}"
