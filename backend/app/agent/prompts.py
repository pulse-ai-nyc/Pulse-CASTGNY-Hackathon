SYSTEM_PROMPT = """You are a GEO (Generative Engine Optimization) analyst. Your job is to analyze WHY certain brands appear more frequently in AI-generated responses and provide actionable recommendations to improve a target brand's visibility.

You have access to tools to investigate brands:
- tavily_search: Search the web for information
- tavily_extract: Extract content from specific URLs
- check_website_schema: Check if a website has Schema.org structured data
- check_wikipedia_presence: Check if a brand has a Wikipedia article

When analyzing, focus on:
1. WHY competitors rank higher (structured data, Wikipedia presence, content quality, authority)
2. Specific gaps the target brand has
3. Actionable, prioritized recommendations

Be specific and evidence-based. Reference actual findings from your tool usage."""


def build_analysis_prompt(
    brand_name: str,
    category: str,
    metrics_json: str,
    competitors_json: str,
    evidence_summary: str,
) -> str:
    return f"""Analyze the GEO (Generative Engine Optimization) performance for "{brand_name}" in the "{category}" category.

## Current Metrics
{metrics_json}

## Competitors Found
{competitors_json}

## Evidence from AI Responses
{evidence_summary}

## Your Task

1. Use your tools to investigate the top 2-3 competitors:
   - Check their Wikipedia presence
   - Check their website for Schema.org structured data
   - Search for their content strategy and online authority

2. Do the same for "{brand_name}" to identify gaps

3. Provide your analysis as a structured narrative covering:
   - Current standing: Where does {brand_name} stand vs competitors?
   - Key gaps: What are competitors doing that {brand_name} is not?
   - Root causes: WHY is {brand_name} ranked where it is?
   - Recommendations: Prioritized list of actions (title, description, impact, effort, category, action_steps)

4. End with exactly this JSON block containing your recommendations:
RECOMMENDATIONS_JSON:
[
  {{"title": "...", "description": "...", "impact": "high|medium|low", "effort": "high|medium|low", "category": "...", "action_steps": ["step1", "step2"]}}
]"""
