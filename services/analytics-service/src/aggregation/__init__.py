"""
Aggregation layer.
Runs scheduled jobs (hourly / daily) to compute aggregated metrics:
  - Document view counts, purchase counts, revenue per seller
  - University-level activity (top courses, trending docs)
  - Cohort retention (D1 / D7 / D30)
"""
from dataclasses import dataclass
from typing import List

@dataclass
class DocumentMetrics:
    asset_id:       str
    views_24h:      int
    purchases_24h:  int
    revenue_24h:    int   # in lowest denomination (agorot/cents)
    avg_rating:     float

@dataclass
class SellerMetrics:
    seller_id:        str
    total_earnings:   int
    active_documents: int
    avg_rating:       float
    conversion_rate:  float   # purchases / views

def aggregate_document_metrics(asset_ids: List[str]) -> List[DocumentMetrics]:
    """
    Placeholder: query the analytics DB / warehouse for aggregated stats.
    Returns mock data until the warehouse is wired up.
    """
    return [
        DocumentMetrics(
            asset_id=asset_id,
            views_24h=0,
            purchases_24h=0,
            revenue_24h=0,
            avg_rating=0.0,
        )
        for asset_id in asset_ids
    ]
