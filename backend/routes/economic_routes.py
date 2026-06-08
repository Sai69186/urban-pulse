from fastapi import APIRouter
from data.seed_data import ECONOMIC
from analytics.economic import (
    get_statistics, get_business_activity,
    get_income_affordability_correlation, get_gdp_trend,
    get_economic_health_score,
)

router = APIRouter(prefix="/api/economic", tags=["Economic"])


@router.get("/")
def economic_data():
    return {"data": ECONOMIC, "count": len(ECONOMIC)}


@router.get("/statistics")
def economic_statistics():
    return get_statistics()


@router.get("/business-activity")
def business_activity():
    return get_business_activity()


@router.get("/income-affordability-correlation")
def income_affordability():
    return get_income_affordability_correlation()


@router.get("/gdp-trend")
def gdp_trend():
    return get_gdp_trend()


@router.get("/health-score")
def economic_health_score():
    return get_economic_health_score()
