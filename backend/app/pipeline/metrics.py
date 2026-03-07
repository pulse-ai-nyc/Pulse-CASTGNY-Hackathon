from collections import defaultdict

from app.models.metrics import (
    CompetitorEntry,
    QueryResult,
    SentimentBreakdown,
    SoMMetrics,
)


def compute_som_metrics(
    results: list[QueryResult], target_brand: str
) -> SoMMetrics:
    target_lower = target_brand.lower()
    total_queries = len(set(r.query for r in results))
    queries_with_brand = set()
    positions: list[int] = []
    queries_with_citation = set()

    for r in results:
        for m in r.brands_mentioned:
            if m.brand_name.lower() == target_lower:
                queries_with_brand.add(r.query)
                positions.append(m.position)
        for url in r.cited_urls:
            if target_lower in url.lower():
                queries_with_citation.add(r.query)

    som = (len(queries_with_brand) / total_queries * 100) if total_queries > 0 else 0
    avg_pos = sum(positions) / len(positions) if positions else None
    citation = (len(queries_with_citation) / total_queries * 100) if total_queries > 0 else 0

    return SoMMetrics(
        share_of_model=round(som, 1),
        total_queries=total_queries,
        queries_with_brand=len(queries_with_brand),
        average_position=round(avg_pos, 1) if avg_pos is not None else None,
        citation_presence=round(citation, 1),
    )


def compute_competitors(
    results: list[QueryResult], target_brand: str
) -> list[CompetitorEntry]:
    brand_data: dict[str, dict] = defaultdict(
        lambda: {"count": 0, "positions": [], "sentiment": {"positive": 0, "neutral": 0, "negative": 0}}
    )

    for r in results:
        for m in r.brands_mentioned:
            name = m.brand_name
            brand_data[name]["count"] += 1
            brand_data[name]["positions"].append(m.position)
            brand_data[name]["sentiment"][m.sentiment] += 1

    total_mentions = sum(d["count"] for d in brand_data.values())
    target_lower = target_brand.lower()

    entries = []
    for name, data in brand_data.items():
        sov = (data["count"] / total_mentions * 100) if total_mentions > 0 else 0
        avg_pos = sum(data["positions"]) / len(data["positions"])
        entries.append(
            CompetitorEntry(
                brand_name=name,
                mention_count=data["count"],
                share_of_voice=round(sov, 1),
                average_position=round(avg_pos, 1),
                sentiment_breakdown=SentimentBreakdown(**data["sentiment"]),
                is_target_brand=name.lower() == target_lower,
            )
        )

    entries.sort(key=lambda e: e.mention_count, reverse=True)

    # Keep target brand + top 10 competitors
    target = [e for e in entries if e.is_target_brand]
    others = [e for e in entries if not e.is_target_brand][:10]
    return target + others
