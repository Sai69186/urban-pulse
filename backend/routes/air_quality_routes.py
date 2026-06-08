from fastapi import APIRouter
from data.seed_data import AIR_QUALITY, NEIGHBORHOODS
from analytics.air_quality import (
    get_statistics, get_correlation_with_health,
    get_seasonal_analysis, get_worst_months, get_health_impact_score,
)

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])


@router.get("/")
def air_quality_data():
    """Full monthly air quality dataset."""
    return {"data": AIR_QUALITY, "count": len(AIR_QUALITY)}


@router.get("/statistics")
def air_quality_statistics():
    """Descriptive statistics for all pollutants with WHO threshold comparison."""
    return get_statistics()


@router.get("/health-correlation")
def health_correlation():
    """Pearson correlation between pollutants and hospital visits."""
    return get_correlation_with_health()


@router.get("/seasonal")
def seasonal_analysis():
    """Average pollutant levels by season."""
    return get_seasonal_analysis()


@router.get("/worst-months")
def worst_months():
    """Top 3 worst months by AQI."""
    return get_worst_months()


@router.get("/health-impact-score")
def health_impact_score():
    """Composite health impact score based on WHO exceedances."""
    return get_health_impact_score()
