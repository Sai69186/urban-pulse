from fastapi import APIRouter
from data.seed_data import CRIME
from analytics.crime import (
    get_summary, get_type_breakdown, get_statistics,
    get_seasonal_pattern, get_neighborhood_risk, get_anomaly_months,
)

router = APIRouter(prefix="/api/crime", tags=["Crime"])


@router.get("/")
def crime_data():
    return {"data": CRIME, "count": len(CRIME)}


@router.get("/summary")
def crime_summary():
    return get_summary()


@router.get("/type-breakdown")
def type_breakdown():
    return get_type_breakdown()


@router.get("/statistics")
def crime_statistics():
    return get_statistics()


@router.get("/seasonal")
def seasonal_pattern():
    return get_seasonal_pattern()


@router.get("/neighborhood-risk")
def neighborhood_risk():
    return get_neighborhood_risk()


@router.get("/anomaly-months")
def anomaly_months():
    return get_anomaly_months()
