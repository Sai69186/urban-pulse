from fastapi import APIRouter
from analytics.forecast import get_all_forecasts, get_livability_forecast_chart
from analytics.correlation import get_correlation_matrix, get_top_correlations, get_pairwise_stats

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])


@router.get("/")
def all_forecasts():
    """ARIMA forecasts for all key metrics (3-month horizon)."""
    return get_all_forecasts()


@router.get("/livability-chart")
def livability_chart():
    """Chart-ready data: 12-month actual + 3-month forecast with confidence bands."""
    return {"data": get_livability_forecast_chart()}


@router.get("/correlation-matrix")
def correlation_matrix():
    return get_correlation_matrix()


@router.get("/top-correlations")
def top_correlations():
    return {"data": get_top_correlations(10)}


@router.get("/pairwise-stats")
def pairwise_stats():
    return {"data": get_pairwise_stats()}
