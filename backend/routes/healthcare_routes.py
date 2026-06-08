from fastapi import APIRouter
from data.seed_data import HEALTH
from analytics.healthcare import (
    get_statistics, get_icu_analysis, get_respiratory_vs_aqi,
    get_response_time_benchmark, get_public_health_score,
)

router = APIRouter(prefix="/api/healthcare", tags=["Healthcare"])


@router.get("/")
def healthcare_data():
    return {"data": HEALTH, "count": len(HEALTH)}


@router.get("/statistics")
def healthcare_statistics():
    return get_statistics()


@router.get("/icu-analysis")
def icu_analysis():
    return get_icu_analysis()


@router.get("/respiratory-aqi-correlation")
def respiratory_aqi():
    return get_respiratory_vs_aqi()


@router.get("/response-time-benchmark")
def response_time():
    return get_response_time_benchmark()


@router.get("/public-health-score")
def public_health_score():
    return get_public_health_score()
