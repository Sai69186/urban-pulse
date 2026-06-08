"""
Urban Pulse — FastAPI Backend
City Health & Livability Intelligence Platform

Endpoints:
  GET /api/overview          — City KPI summary
  GET /api/air-quality/*     — Air quality analytics
  GET /api/crime/*           — Crime analytics
  GET /api/economic/*        — Economic analytics
  GET /api/healthcare/*      — Healthcare analytics
  GET /api/noise/*           — Noise analytics
  GET /api/neighborhoods/*   — Neighborhood scores
  GET /api/anomalies/*       — Anomaly detection
  GET /api/sentiment/*       — Citizen sentiment
  GET /api/forecast/*        — ARIMA forecasting & correlations
"""

import sys
import os

# Ensure backend/ is on the Python path so sub-modules resolve correctly
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.air_quality_routes  import router as aq_router
from routes.crime_routes        import router as crime_router
from routes.economic_routes     import router as econ_router
from routes.healthcare_routes   import router as health_router
from routes.noise_routes        import router as noise_router
from routes.neighborhood_routes import router as nbhd_router
from routes.anomaly_routes      import router as anomaly_router
from routes.sentiment_routes    import router as sentiment_router
from routes.forecast_routes     import router as forecast_router

from data.seed_data import (
    AIR_QUALITY, CRIME, ECONOMIC, HEALTH,
    NEIGHBORHOOD_SCORES, ANOMALIES,
)
from analytics.anomaly_detection import get_anomaly_summary

app = FastAPI(
    title="Urban Pulse API",
    description="City Health & Livability Intelligence Platform — Data Analyst Portfolio Project",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(aq_router)
app.include_router(crime_router)
app.include_router(econ_router)
app.include_router(health_router)
app.include_router(noise_router)
app.include_router(nbhd_router)
app.include_router(anomaly_router)
app.include_router(sentiment_router)
app.include_router(forecast_router)


@app.get("/")
def root():
    return {
        "project":     "Urban Pulse",
        "version":     "2.0.0",
        "description": "City Health & Livability Intelligence Platform",
        "docs":        "/docs",
        "endpoints":   [
            "/api/overview",
            "/api/air-quality",
            "/api/crime",
            "/api/economic",
            "/api/healthcare",
            "/api/noise",
            "/api/neighborhoods",
            "/api/anomalies",
            "/api/sentiment",
            "/api/forecast",
        ],
    }


@app.get("/api/overview")
def overview():
    """Aggregated city-wide KPIs from all datasets."""
    total_pop    = sum(n.get("population", 0) for n in [
        {"population": 42800}, {"population": 31200}, {"population": 28600},
        {"population": 19400}, {"population": 35100}, {"population": 47300},
        {"population": 22900}, {"population": 26700},
    ])
    avg_livability = round(
        sum(n["livabilityScore"] for n in NEIGHBORHOOD_SCORES) / len(NEIGHBORHOOD_SCORES), 1
    )
    latest_aqi    = AIR_QUALITY[-1]["AQI"]
    prev_aqi      = AIR_QUALITY[-2]["AQI"]
    crime_latest  = CRIME[-1]["total"]
    crime_prev    = CRIME[-2]["total"]
    unemp_latest  = ECONOMIC[-1]["unemployment"]
    unemp_prev    = ECONOMIC[-2]["unemployment"]
    health_score  = HEALTH[-1]["vaccinationRate"]
    anomaly_info  = get_anomaly_summary()

    return {
        "livabilityScore":   avg_livability,
        "livabilityChange":  2.4,
        "totalPopulation":   total_pop,
        "avgAQI":            latest_aqi,
        "aqiChange":         round((latest_aqi - prev_aqi) / prev_aqi * 100, 1),
        "crimeIndex":        round(crime_latest / total_pop * 10000, 1),
        "crimeChange":       round((crime_latest - crime_prev) / crime_prev * 100, 1),
        "healthcareScore":   health_score,
        "healthcareChange":  1.8,
        "unemploymentRate":  unemp_latest,
        "unemploymentChange":round(unemp_latest - unemp_prev, 2),
        "greenSpaceRatio":   18.4,
        "greenSpaceChange":  1.2,
        "sentimentScore":    55,
        "sentimentChange":   3.1,
        "activeAlerts":      anomaly_info["critical_count"] + anomaly_info["high_count"],
        "totalAlerts":       anomaly_info["total_alerts"],
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Urban Pulse API v2.0"}
