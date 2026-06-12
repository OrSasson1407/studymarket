"""
Event ingestion pipeline.
Receives raw events from services (purchase, view, search) via a Kafka/Redis Stream
and writes them to the data warehouse (Postgres analytics schema / BigQuery).
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, Optional
import json

EventType = Literal[
    "document.viewed",
    "document.purchased",
    "document.followed",
    "search.performed",
    "user.registered",
    "user.verified",
]

@dataclass
class AnalyticsEvent:
    event_type: EventType
    user_id: Optional[str]
    session_id: str
    properties: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_json(self) -> str:
        return json.dumps({
            "event_type": self.event_type,
            "user_id":    self.user_id,
            "session_id": self.session_id,
            "properties": self.properties,
            "timestamp":  self.timestamp.isoformat(),
        })

def ingest_event(event: AnalyticsEvent) -> None:
    """
    Entry point for event ingestion.
    In production: publish to Kafka topic `studymarket.events`.
    For dev: print to stdout.
    """
    print("[analytics] ingest:", event.to_json())
