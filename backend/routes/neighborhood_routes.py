from fastapi import APIRouter, Query
from data.seed_data import NEIGHBORHOOD_SCORES, NEIGHBORHOODS
from analytics.neighborhoods import (
    get_all_scores, get_rankings_by_metric,
    get_zone_summary, get_gap_analysis, get_improvement_priorities,
)

router = APIRouter(prefix="/api/neighborhoods", tags=["Neighborhoods"])


@router.get("/")
def neighborhoods_data():
    return {"data": NEIGHBORHOOD_SCORES, "count": len(NEIGHBORHOOD_SCORES)}


@router.get("/scores")
def all_scores():
    return get_all_scores()


@router.get("/rankings")
def rankings():
    return get_rankings_by_metric()


@router.get("/zones")
def zones():
    return get_zone_summary()


@router.get("/gap-analysis")
def gap_analysis():
    return get_gap_analysis()


@router.get("/improvement-priorities")
def improvement_priorities():
    return get_improvement_priorities()


@router.get("/{neighborhood_id}")
def neighborhood_detail(neighborhood_id: int):
    scores = {n["id"]: n for n in NEIGHBORHOOD_SCORES}
    info   = {n["id"]: n for n in NEIGHBORHOODS}
    if neighborhood_id not in scores:
        return {"error": "Neighborhood not found"}
    return {**scores[neighborhood_id], **info.get(neighborhood_id, {})}
