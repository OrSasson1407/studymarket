from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
import os, json, psycopg2, redis

app = FastAPI(title="StudyMarket Analytics", version="1.0.0")

DB_URL        = os.getenv("DATABASE_URL", "postgresql://root:rootpassword@localhost:5437/studymarket_dev")
REDIS_URL     = os.getenv("REDIS_URL", "redis://localhost:6379")
INT_SECRET    = os.getenv("INTERNAL_SECRET", "internal-secret-local")

r = redis.from_url(REDIS_URL, decode_responses=True)

def get_db():
    return psycopg2.connect(DB_URL)

def require_internal(x_internal_secret: str = Header(None)):
    if x_internal_secret != INT_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-service"}

class EventPayload(BaseModel):
    event: str        # e.g. "document.viewed", "document.purchased"
    userId: str | None = None
    assetId: str | None = None
    meta: dict = {}

@app.post("/api/analytics/event")
def ingest_event(payload: EventPayload, x_internal_secret: str = Header(None)):
    require_internal(x_internal_secret)
    key = f"analytics:events:{datetime.utcnow().strftime('%Y-%m-%d')}"
    r.rpush(key, json.dumps({
        "event":   payload.event,
        "userId":  payload.userId,
        "assetId": payload.assetId,
        "meta":    payload.meta,
        "ts":      datetime.utcnow().isoformat(),
    }))
    r.expire(key, 60 * 60 * 24 * 30)  # 30 days
    return {"queued": True}

@app.get("/api/analytics/summary")
def summary(x_internal_secret: str = Header(None)):
    require_internal(x_internal_secret)
    conn = get_db()
    cur  = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM "User"')
    total_users = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "ContentAsset" WHERE status = \'LIVE\'')
    live_assets = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*), COALESCE(SUM("grossAmount"), 0) FROM "PaymentTransaction" WHERE status = \'SUCCEEDED\'')
    row = cur.fetchone()
    cur.close(); conn.close()
    return {
        "totalUsers":       total_users,
        "liveAssets":       live_assets,
        "totalTransactions": row[0],
        "totalGrossAgorot":  row[1],
    }