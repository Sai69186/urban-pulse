import sys, os
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
from routes.upload_routes       import router as upload_router

from data.seed_data import AIR_QUALITY, CRIME, ECONOMIC, HEALTH, NEIGHBORHOOD_SCORES, ANOMALIES
from data.session_store import get_dataset, get_all_status
from analytics.anomaly_detection import get_anomaly_summary

app = FastAPI(
    title="Urban Pulse API",
    description="City Intelligence Platform — accepts user-uploaded data (CSV/Excel/JSON)",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174","http://localhost:3000","*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
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
    return {"project":"Urban Pulse","version":"3.0.0","docs":"/docs","upload":"/api/upload"}


@app.get("/api/overview")
def overview():
    aq    = get_dataset("air_quality",  AIR_QUALITY)
    cr    = get_dataset("crime",        CRIME)
    ec    = get_dataset("economic",     ECONOMIC)
    he    = get_dataset("health",       HEALTH)
    nb    = get_dataset("neighborhoods",NEIGHBORHOOD_SCORES)

    total_pop = 254000  # fixed city population
    avg_livability = round(sum(n.get("livabilityScore",0) for n in nb) / max(len(nb),1), 1)
    latest_aqi  = aq[-1].get("AQI",0)  if aq  else 0
    prev_aqi    = aq[-2].get("AQI",1)  if len(aq)>1 else 1
    crime_now   = cr[-1].get("total",0) if cr  else 0
    crime_prev  = cr[-2].get("total",1) if len(cr)>1 else 1
    unemp_now   = ec[-1].get("unemployment",0) if ec else 0
    unemp_prev  = ec[-2].get("unemployment",0) if len(ec)>1 else 0
    vacc        = he[-1].get("vaccinationRate",0) if he else 0
    anomaly_info = get_anomaly_summary()

    return {
        "livabilityScore":    avg_livability,
        "livabilityChange":   2.4,
        "totalPopulation":    total_pop,
        "avgAQI":             latest_aqi,
        "aqiChange":          round((latest_aqi-prev_aqi)/max(prev_aqi,1)*100,1),
        "crimeIndex":         round(crime_now/total_pop*10000,1),
        "crimeChange":        round((crime_now-crime_prev)/max(crime_prev,1)*100,1),
        "healthcareScore":    vacc,
        "healthcareChange":   1.8,
        "unemploymentRate":   unemp_now,
        "unemploymentChange": round(unemp_now-unemp_prev,2),
        "greenSpaceRatio":    18.4,
        "greenSpaceChange":   1.2,
        "sentimentScore":     55,
        "sentimentChange":    3.1,
        "activeAlerts":       anomaly_info["critical_count"]+anomaly_info["high_count"],
        "totalAlerts":        anomaly_info["total_alerts"],
        "dataStatus":         get_all_status(),
    }


@app.get("/api/health")
def health_check():
    return {"status":"ok","version":"3.0.0","data_status": get_all_status()}
