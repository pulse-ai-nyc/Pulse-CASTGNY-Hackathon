import json
import logging
from collections.abc import AsyncGenerator

from app.agent.prompts import SYSTEM_PROMPT, build_analysis_prompt
from app.agent.tools import TOOL_DEFINITIONS, execute_tool
from app.models.metrics import CompetitorEntry, QueryResult, SoMMetrics
from app.models.report import Recommendation
from app.services import anthropic_client

logger = logging.getLogger(__name__)

MAX_AGENT_TURNS = 10


async def run_agent_analysis(
    brand_name: str,
    category: str,
    metrics: SoMMetrics,
    competitors: list[CompetitorEntry],
    evidence: list[QueryResult],
) -> AsyncGenerator[dict, None]:
    evidence_summary = ""
    for r in evidence[:10]:
        brands = ", ".join(m.brand_name for m in r.brands_mentioned) or "none"
        evidence_summary += f"- Query: \"{r.query}\" ({r.source}) → Brands mentioned: {brands}\n"

    user_prompt = build_analysis_prompt(
        brand_name=brand_name,
        category=category,
        metrics_json=metrics.model_dump_json(indent=2),
        competitors_json=json.dumps(
            [c.model_dump() for c in competitors[:8]], indent=2
        ),
        evidence_summary=evidence_summary,
    )

    messages: list[dict] = [{"role": "user", "content": user_prompt}]

    for turn in range(MAX_AGENT_TURNS):
        response = await anthropic_client.query_with_tools(
            messages=messages,
            system=SYSTEM_PROMPT,
            tools=TOOL_DEFINITIONS,
            max_tokens=4096,
        )

        assistant_content = response.content
        messages.append({"role": "assistant", "content": assistant_content})

        for block in assistant_content:
            if block.type == "text":
                yield {"type": "analysis_chunk", "text": block.text}

        if response.stop_reason == "end_turn":
            break

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in assistant_content:
                if block.type == "tool_use":
                    logger.info(f"Agent calling tool: {block.name}")
                    result = await execute_tool(block.name, block.input)
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }
                    )
            messages.append({"role": "user", "content": tool_results})

    full_text = ""
    for msg in messages:
        if msg["role"] == "assistant":
            content = msg["content"]
            if isinstance(content, list):
                for block in content:
                    if hasattr(block, "text"):
                        full_text += block.text
            elif isinstance(content, str):
                full_text += content

    recommendations = _extract_recommendations(full_text)
    for rec in recommendations:
        yield {"type": "recommendation", "data": rec}


def _extract_recommendations(text: str) -> list[Recommendation]:
    marker = "RECOMMENDATIONS_JSON:"
    idx = text.find(marker)
    if idx == -1:
        return []
    json_text = text[idx + len(marker) :]
    try:
        start = json_text.index("[")
        end = json_text.rindex("]") + 1
        parsed = json.loads(json_text[start:end])
        return [Recommendation(**r) for r in parsed]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse recommendations: {e}")
        return []
