from fastapi import APIRouter, Query
from analytics.anomaly_detection import (
    get_statistical_anomalies, get_enriched_anomalies, get_anomaly_summary,
)

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


@router.get("/")
def anomalies(severity: str = Query(None, description="Filter by severity: critical|high|medium|low")):
    data = get_enriched_anomalies()
    if severity:
        data = [a for a in data if a["severity"] == severity]
    return {"data": data, "count": len(data)}


@router.get("/summary")
def anomaly_summary():
    return get_anomaly_summary()


@router.get("/statistical")
def statistical_anomalies():
    return get_statistical_anomalies()
