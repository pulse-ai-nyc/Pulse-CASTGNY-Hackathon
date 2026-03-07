import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from app.agent.runner import run_agent_analysis
from app.models import AnalysisRequest, GEOReport
from app.pipeline.brand_discovery import discover_brand
from app.pipeline.content_gen import generate_artifacts
from app.pipeline.metrics import compute_competitors, compute_som_metrics
from app.pipeline.multi_source import query_single
from app.pipeline.parser import parse_all_results
from app.pipeline.query_generator import generate_queries

router = APIRouter()
logger = logging.getLogger(__name__)


def _sse_event(event: str, data: dict) -> dict:
    return {"event": event, "data": json.dumps(data)}


async def _run_analysis(request: AnalysisRequest):
    try:
        # Phase 1: Discover brand
        yield _sse_event("phase", {"name": "Discovering brand", "step": 1, "total": 7})
        profile = await discover_brand(request.brand_name, request.website_url)
        category = profile.category
        yield _sse_event("brand_profile", {
            "category": profile.category,
            "description": profile.brand_description,
            "key_products": profile.key_products,
        })

        # Phase 2: Generate queries
        yield _sse_event("phase", {"name": "Generating queries", "step": 2, "total": 7})
        queries = await generate_queries(
            request.brand_name, category, request.customer_segment
        )
        yield _sse_event("queries", {"queries": queries})

        # Phase 3: Query sources
        yield _sse_event("phase", {"name": "Querying AI sources", "step": 3, "total": 7})
        all_results = []
        for query in queries:
            results = await query_single(query)
            all_results.extend(results)
            for r in results:
                yield _sse_event(
                    "source_result",
                    {"query": r.query, "source": r.source, "status": "complete"},
                )

        # Phase 4: Parse responses
        yield _sse_event("phase", {"name": "Parsing responses", "step": 4, "total": 7})
        parsed_results = await parse_all_results(all_results, request.brand_name)

        # Phase 5: Compute metrics
        yield _sse_event("phase", {"name": "Computing metrics", "step": 5, "total": 7})
        metrics = compute_som_metrics(parsed_results, request.brand_name)
        competitors = compute_competitors(parsed_results, request.brand_name)

        yield _sse_event("metrics", metrics.model_dump())
        for comp in competitors:
            yield _sse_event("competitor", comp.model_dump())

        # Phase 6: Agent analysis
        yield _sse_event("phase", {"name": "AI analysis & recommendations", "step": 6, "total": 7})
        recommendations = []
        analysis_narrative = ""

        async for event in run_agent_analysis(
            brand_name=request.brand_name,
            category=category,
            metrics=metrics,
            competitors=competitors,
            evidence=parsed_results,
        ):
            if event["type"] == "analysis_chunk":
                analysis_narrative += event["text"]
                yield _sse_event("analysis_chunk", {"text": event["text"]})
            elif event["type"] == "recommendation":
                rec = event["data"]
                recommendations.append(rec)
                yield _sse_event("recommendation", rec.model_dump())

        # Phase 7: Content generation
        yield _sse_event("phase", {"name": "Generating content", "step": 7, "total": 7})
        content_artifacts = await generate_artifacts(
            request.brand_name, category, metrics, competitors
        )
        for artifact in content_artifacts:
            yield _sse_event("content", artifact.model_dump())

        # Complete
        report = GEOReport(
            id=str(uuid.uuid4()),
            brand_name=request.brand_name,
            category=category,
            created_at=datetime.now(timezone.utc).isoformat(),
            metrics=metrics,
            competitors=competitors,
            evidence=parsed_results,
            recommendations=recommendations,
            content_artifacts=content_artifacts,
            analysis_narrative=analysis_narrative,
        )
        yield _sse_event("complete", report.model_dump())

    except Exception as e:
        logger.exception("Analysis pipeline error")
        yield _sse_event("error", {"message": str(e)})


@router.post("/analyze")
async def analyze(request: AnalysisRequest):
    return EventSourceResponse(_run_analysis(request))
