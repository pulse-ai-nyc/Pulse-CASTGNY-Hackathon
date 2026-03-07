import json
import logging
import re
from collections.abc import AsyncGenerator

from app.agent.prompts import SYSTEM_PROMPT, build_analysis_prompt
from app.agent.tools import execute_tool
from app.models.metrics import CompetitorEntry, QueryResult, SoMMetrics
from app.models.report import Recommendation
from app.services import anthropic_client

logger = logging.getLogger(__name__)

MAX_AGENT_TURNS = 10

TOOL_DISPATCH_INSTRUCTIONS = """
When you need to use a tool, output EXACTLY this format on its own line:
TOOL_CALL: {"tool": "<tool_name>", "input": {<input_json>}}

Available tools:
- tavily_search: {"tool": "tavily_search", "input": {"query": "search terms"}}
- tavily_extract: {"tool": "tavily_extract", "input": {"url": "https://..."}}
- check_website_schema: {"tool": "check_website_schema", "input": {"url": "https://..."}}
- check_wikipedia_presence: {"tool": "check_wikipedia_presence", "input": {"brand_name": "Brand"}}
- check_press_reviews: {"tool": "check_press_reviews", "input": {"brand_name": "Brand", "category": "Category"}}
- check_crawlability: {"tool": "check_crawlability", "input": {"url": "https://..."}}
- check_content_freshness: {"tool": "check_content_freshness", "input": {"url": "https://..."}}

After each TOOL_CALL line, STOP and wait. The tool result will be provided to you.
You may make multiple tool calls across turns (up to 10). When done investigating, provide your final analysis.
"""

_TOOL_CALL_RE = re.compile(r"TOOL_CALL\s*:\s*", re.IGNORECASE)


def _extract_tool_json(text: str, start: int) -> dict | None:
    """Extract JSON object starting from position `start` using brace-depth matching."""
    # Strip optional markdown fences
    remaining = text[start:].lstrip()
    if remaining.startswith("```"):
        remaining = re.sub(r"^```\w*\n?", "", remaining)
        remaining = re.sub(r"\n?```\s*$", "", remaining)

    brace_start = remaining.find("{")
    if brace_start == -1:
        return None

    depth = 0
    for i in range(brace_start, len(remaining)):
        if remaining[i] == "{":
            depth += 1
        elif remaining[i] == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(remaining[brace_start : i + 1])
                except json.JSONDecodeError:
                    return None
    return None


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

    system = SYSTEM_PROMPT + "\n\n" + TOOL_DISPATCH_INSTRUCTIONS
    conversation = user_prompt
    full_text = ""

    for turn in range(MAX_AGENT_TURNS):
        response = await anthropic_client.query(conversation, system=system)

        if response.startswith("Error:"):
            logger.error(f"Agent turn {turn} got error: {response}")
            yield {"type": "analysis_chunk", "text": f"[Agent error, continuing...]\n"}
            break

        full_text += response + "\n"

        # Find tool call using regex (handles variations like no space after colon)
        match = _TOOL_CALL_RE.search(response)
        tool_call_found = False

        if match:
            # Yield text before the tool call
            pre_text = response[: match.start()].strip()
            if pre_text:
                yield {"type": "analysis_chunk", "text": pre_text + "\n"}

            tool_data = _extract_tool_json(response, match.end())
            if tool_data and "tool" in tool_data:
                tool_call_found = True
                tool_name = tool_data["tool"]
                tool_input = tool_data.get("input", {})
                logger.info(f"Agent calling tool: {tool_name}")

                try:
                    result = await execute_tool(tool_name, tool_input)
                except Exception as e:
                    logger.error(f"Tool execution error ({tool_name}): {e}")
                    result = f"Error executing tool: {e}"

                conversation = (
                    f"Previous context:\n{conversation}\n\n"
                    f"Your previous response:\n{response}\n\n"
                    f"Tool result for {tool_name}:\n{result}\n\n"
                    f"Continue your analysis. Use more tools if needed, "
                    f"or provide your final analysis with RECOMMENDATIONS_JSON."
                )
            else:
                logger.error(f"Found TOOL_CALL marker but failed to parse JSON")
                tool_call_found = False

        if not tool_call_found:
            yield {"type": "analysis_chunk", "text": response}
            break

    recommendations = _extract_recommendations(full_text)
    for rec in recommendations:
        yield {"type": "recommendation", "data": rec}


def _extract_recommendations(text: str) -> list[Recommendation]:
    marker = "RECOMMENDATIONS_JSON:"
    idx = text.find(marker)
    if idx == -1:
        return []
    json_text = text[idx + len(marker):]
    try:
        start = json_text.index("[")
        end = json_text.rindex("]") + 1
        parsed = json.loads(json_text[start:end])
        return [Recommendation(**r) for r in parsed]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse recommendations: {e}")
        return []
