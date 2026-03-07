# GEO Agent - Project Charter (OpenSpec)

## 1. Project Overview

GEO Agent is an AI-powered system that measures and improves a brand's
Share of Model (SoM) — the percentage of AI-generated answers mentioning the brand.

- Hackathon: Pulse AI NYC x CASTGNY
- Constraint: Must use LIVE data, must be publicly deployed
- Goal: Input a brand → get SoM score, competitor analysis, and optimization plan

## 2. Architecture

### 2.1 Hybrid Agent Architecture

The system uses a TWO-LAYER design:

Layer 1 - Direct Pipeline (deterministic):
  - Query generation, API calls, metric computation
  - Uses Anthropic Python SDK directly
  - Guarantees reliable, repeatable results

Layer 2 - Agent SDK (intelligent):
  - Competitor analysis, recommendation generation
  - Uses Claude Agent SDK with custom tools
  - Provides reasoning and insights

WHY HYBRID: The pipeline layer ensures metrics are always correct (30% of
judging = Reliability). The agent layer provides depth of insight (25% of
judging = Insight Quality). Neither layer alone satisfies both.

### 2.2 System Flow

Input: brand_name + category
  → [Pipeline] Generate 5-10 high-intent queries via Claude
  → [Pipeline] Query Tavily API (Source 1) + Claude API (Source 2) in parallel
  → [Pipeline] Parse responses: extract brand mentions, positions, sentiment
  → [Pipeline] Compute SoM, SoV, avg position, citation presence
  → [Agent SDK] Analyze WHY competitors rank higher (uses tools to investigate)
  → [Agent SDK] Generate prioritized recommendations
  → [Pipeline] Generate content artifacts (wiki summary, comparison page, FAQ)
  → Output: Structured GEOReport via SSE stream

### 2.3 Tech Stack

Backend:
  - Language: Python 3.12+
  - Framework: FastAPI
  - Agent: claude-agent-sdk (Claude Agent SDK)
  - LLM: anthropic Python SDK (Claude)
  - Search: tavily-python (Tavily API)
  - Async: asyncio + aiohttp

Frontend:
  - Framework: Next.js 14 (App Router)
  - Language: TypeScript (strict mode)
  - Styling: Tailwind CSS
  - No external chart libraries

Deployment:
  - Backend: Railway (Docker)
  - Frontend: Vercel

## 3. Directory Structure

### 3.1 Backend

backend/
  pyproject.toml
  requirements.txt
  Dockerfile
  .env.example
  app/
    __init__.py
    main.py                    # FastAPI app, CORS, mount routers
    config.py                  # pydantic-settings: ANTHROPIC_API_KEY, TAVILY_API_KEY
    models/
      __init__.py
      request.py               # AnalysisRequest
      metrics.py               # BrandMention, QueryResult, SoMMetrics, CompetitorEntry
      report.py                # Recommendation, ContentArtifact, GEOReport
    services/
      __init__.py
      tavily_client.py         # async search(query) and extract(url) wrappers
      anthropic_client.py      # async query(prompt) wrapper for Claude as AI source
    pipeline/
      __init__.py
      query_generator.py       # generate_queries(brand, category) -> list[str]
      multi_source.py          # query_all_sources(queries) -> list[QueryResult]
      parser.py                # parse_response(text, brand) -> list[BrandMention]
      metrics.py               # compute_metrics(results, brand) -> SoMMetrics
      content_gen.py           # generate_artifacts(brand, metrics) -> list[ContentArtifact]
    agent/
      __init__.py
      tools.py                 # @tool: tavily_search, tavily_extract, check_schema, check_wikipedia
      prompts.py               # system_prompt, analysis_prompt templates
      runner.py                # run_agent_analysis(brand, metrics, evidence) -> str
    routers/
      __init__.py
      analysis.py              # POST /api/analyze (SSE stream)
      health.py                # GET /api/health

### 3.2 Frontend

frontend/src/
  app/
    layout.tsx                 # Root layout, global styles
    page.tsx                   # Landing: BrandInputForm
    report/[id]/page.tsx       # Report display page
  components/
    BrandInputForm.tsx         # brand_name + category inputs
    ProgressStream.tsx         # Vertical stepper, real-time updates
    ScoreGauge.tsx             # Circular SoM gauge (red/yellow/green)
    CompetitorTable.tsx        # Sortable competitor comparison
    SentimentChart.tsx         # Sentiment breakdown bars
    EvidencePanel.tsx          # Accordion: raw responses + cited URLs
    ActionPlan.tsx             # Prioritized recommendations
    ContentArtifacts.tsx       # Tabs: wiki / comparison / FAQ / schema
  hooks/
    useAnalysis.ts             # SSE consumer via fetch + ReadableStream
  lib/
    api.ts                     # API_BASE_URL config
    types.ts                   # TypeScript interfaces (mirrors Python models)

## 4. Coding Standards

### 4.1 Python
- All models use Pydantic BaseModel with type hints
- All I/O functions are async (async def)
- Use structured output prompts (request JSON from Claude)
- Error handling: try/except on every external API call, emit SSE error event
- No print() — use logging or SSE events
- Imports: stdlib → third-party → local, separated by blank lines

### 4.2 TypeScript
- Strict mode enabled
- All data structures defined as interfaces in lib/types.ts
- Components are functional with explicit prop types
- No any — always type SSE event data
- Use fetch + ReadableStream for SSE (not EventSource, because POST)

### 4.3 Shared
- Python model field names = TypeScript interface field names (snake_case in both)
- Frontend converts snake_case to display labels in components only

## 5. API Contract

### 5.1 Endpoints

GET  /api/health
  Response: { "status": "ok" }

POST /api/analyze
  Request body: { "brand_name": str, "category": str, "customer_segment"?: str }
  Response: SSE stream (text/event-stream)

### 5.2 SSE Event Protocol

Events are emitted in this order:

  event: phase
  data: {"name": "Generating queries", "step": 1, "total": 6}

  event: queries
  data: {"queries": ["best CRM for startups", ...]}

  event: phase
  data: {"name": "Querying AI sources", "step": 2, "total": 6}

  event: source_result
  data: {"query": "...", "source": "tavily"|"claude", "status": "complete"}

  event: phase
  data: {"name": "Parsing responses", "step": 3, "total": 6}

  event: phase
  data: {"name": "Computing metrics", "step": 4, "total": 6}

  event: metrics
  data: {SoMMetrics}

  event: competitor
  data: {CompetitorEntry}  (one per competitor)

  event: phase
  data: {"name": "AI analysis & recommendations", "step": 5, "total": 6}

  event: analysis_chunk
  data: {"text": "..."}  (streamed text)

  event: recommendation
  data: {Recommendation}

  event: phase
  data: {"name": "Generating content", "step": 6, "total": 6}

  event: content
  data: {ContentArtifact}

  event: complete
  data: {GEOReport}

  event: error
  data: {"message": "..."}  (at any point on failure)

## 6. Data Models

AnalysisRequest:
  brand_name: str (required)
  category: str (required)
  customer_segment: str (optional)

BrandMention:
  brand_name: str
  position: int                    # 1-indexed order of appearance
  sentiment: "positive"|"neutral"|"negative"
  context_snippet: str             # sentence containing the mention

QueryResult:
  query: str
  source: "tavily"|"claude"
  response_text: str
  cited_urls: list[str]
  brands_mentioned: list[BrandMention]

SoMMetrics:
  share_of_model: float            # 0-100
  total_queries: int
  queries_with_brand: int
  average_position: float|null
  citation_presence: float          # 0-100

CompetitorEntry:
  brand_name: str
  mention_count: int
  share_of_voice: float             # 0-100
  average_position: float
  sentiment_breakdown: {positive: int, neutral: int, negative: int}
  is_target_brand: bool

Recommendation:
  title: str
  description: str
  impact: "high"|"medium"|"low"
  effort: "high"|"medium"|"low"
  category: str                     # e.g. "Structured Data", "Content", "Authority"
  action_steps: list[str]

ContentArtifact:
  type: "wikipedia_summary"|"comparison_page"|"faq_content"|"schema_markup"
  title: str
  content: str                      # markdown

GEOReport:
  id: str
  brand_name: str
  category: str
  created_at: str
  metrics: SoMMetrics
  competitors: list[CompetitorEntry]
  evidence: list[QueryResult]
  recommendations: list[Recommendation]
  content_artifacts: list[ContentArtifact]
  analysis_narrative: str

## 7. Environment Variables

Backend (.env):
  ANTHROPIC_API_KEY=sk-ant-...
  TAVILY_API_KEY=tvly-...
  FRONTEND_URL=https://your-app.vercel.app   # for CORS

Frontend (.env.local):
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app

## 8. Agent SDK Configuration

### 8.1 Tools (defined in backend/app/agent/tools.py)

tavily_search(query: str, max_results: int = 5) -> dict
  Search web via Tavily. Returns results with URLs and snippets.

tavily_extract(url: str) -> dict
  Extract clean content from a URL via Tavily.

check_website_schema(url: str) -> dict
  Fetch a page and check for Schema.org JSON-LD markup.

check_wikipedia_presence(brand_name: str) -> dict
  Search Wikipedia for the brand. Returns article summary or "not found".

### 8.2 Agent System Prompt (in backend/app/agent/prompts.py)

The agent receives:
  - Brand name and category
  - Computed SoM metrics
  - All parsed query results with evidence
  - List of competitors found

The agent must:
  - Use tools to investigate WHY competitors rank higher
  - Check competitors' structured data, Wikipedia presence, backlinks
  - Identify specific content gaps
  - Output a structured analysis with prioritized recommendations

### 8.3 Fallback

If claude-agent-sdk cannot run in deployment (requires CLI binary):
  - Fall back to anthropic SDK with tools parameter
  - Implement manual agent loop: send message → check stop_reason →
    execute tool_use blocks → append results → repeat
  - Same tools, same prompts, no CLI dependency

## 9. Key Metric Formulas

SoM = (queries_with_brand / total_queries) * 100

SoV(brand) = (brand_mention_count / sum_all_mention_counts) * 100

avg_position = mean(position for each mention of target brand)

citation_presence = (queries_where_brand_url_cited / total_queries) * 100

## 10. Deployment

### Backend (Railway)
  1. Push to GitHub
  2. Connect Railway to repo, set root directory to backend/
  3. Railway auto-detects Dockerfile
  4. Set env vars in Railway dashboard
  5. Deploy

### Frontend (Vercel)
  1. Push to GitHub
  2. Connect Vercel to repo, set root directory to frontend/
  3. Set NEXT_PUBLIC_API_URL env var
  4. Deploy

### Verification
  1. GET {backend_url}/api/health -> {"status": "ok"}
  2. Open {frontend_url}, enter brand, run analysis
  3. Confirm SSE events stream correctly
  4. Confirm all cited URLs are real and clickable
  5. Run with at least 2 different brands to verify generalization
