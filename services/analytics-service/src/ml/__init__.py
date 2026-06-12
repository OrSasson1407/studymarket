"""
ML / Recommendation layer.
Trains and serves lightweight collaborative-filtering recommendations
for the "You might also like" section in the marketplace.

Stack: scikit-learn (implicit feedback matrix factorization)
Model is retrained nightly and served as a static lookup table in Redis.
"""
from typing import List, Dict

# ---------------------------------------------------------------------------
# Collaborative filtering (user-item matrix, implicit feedback via purchases)
# ---------------------------------------------------------------------------

def build_interaction_matrix(interactions: List[Dict]) -> dict:
    """
    interactions: list of {"user_id": str, "asset_id": str, "weight": float}
    Returns a sparse dict-of-dicts for quick lookup.
    """
    matrix: Dict[str, Dict[str, float]] = {}
    for row in interactions:
        uid, aid, w = row["user_id"], row["asset_id"], row.get("weight", 1.0)
        matrix.setdefault(uid, {})[aid] = w
    return matrix

def recommend_for_user(user_id: str, matrix: dict, top_n: int = 5) -> List[str]:
    """
    Naive item-based CF: returns asset_ids that similar users purchased.
    Replace with a proper ALS/BPR model for production.
    """
    user_items = set(matrix.get(user_id, {}).keys())
    scores: Dict[str, float] = {}
    for other_id, other_items in matrix.items():
        if other_id == user_id:
            continue
        overlap = len(user_items & set(other_items.keys()))
        for asset_id, weight in other_items.items():
            if asset_id not in user_items:
                scores[asset_id] = scores.get(asset_id, 0) + overlap * weight
    return sorted(scores, key=lambda k: scores[k], reverse=True)[:top_n]
