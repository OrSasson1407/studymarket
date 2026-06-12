"""
Report generation.
Produces structured JSON summaries consumed by:
  - Admin dashboard (internal)
  - Seller dashboard (per-seller revenue breakdown)
  - University B2B portal (campus usage stats)
"""
from dataclasses import dataclass, field
from datetime import date
from typing import List

@dataclass
class SellerReport:
    seller_id:      str
    period_start:   date
    period_end:     date
    total_revenue:  int          # agorot / cents
    platform_fee:   int
    net_payout:     int
    documents_sold: int
    top_documents:  List[str] = field(default_factory=list)   # asset_ids

    def to_dict(self) -> dict:
        return {
            "seller_id":      self.seller_id,
            "period":         f"{self.period_start} – {self.period_end}",
            "total_revenue":  self.total_revenue,
            "platform_fee":   self.platform_fee,
            "net_payout":     self.net_payout,
            "documents_sold": self.documents_sold,
            "top_documents":  self.top_documents,
        }

def generate_seller_report(seller_id: str, period_start: date, period_end: date) -> SellerReport:
    """
    Placeholder — query the analytics warehouse for real figures.
    """
    return SellerReport(
        seller_id=seller_id,
        period_start=period_start,
        period_end=period_end,
        total_revenue=0,
        platform_fee=0,
        net_payout=0,
        documents_sold=0,
    )
