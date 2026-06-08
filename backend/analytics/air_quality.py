"""
Air Quality Analytics Module
- Descriptive statistics
- WHO threshold violation detection
- Seasonal decomposition summary
- Pollutant correlation
- Health impact scoring
"""

import pandas as pd
import numpy as np
from scipy import stats
from data.seed_data import AIR_QUALITY, HEALTH

WHO_LIMITS = {"PM25": 15, "PM10": 45, "NO2": 10, "O3": 100, "AQI": 50, "CO": 4.0}
AQI_CATEGORIES = [
    (50,  "Good",                      "#10b981"),
    (100, "Moderate",                  "#f59e0b"),
    (150, "Unhealthy for Sensitive",   "#f97316"),
    (200, "Unhealthy",                 "#ef4444"),
    (300, "Very Unhealthy",            "#8b5cf6"),
    (500, "Hazardous",                 "#6b21a8"),
]


def get_aqi_category(aqi: float) -> dict:
    for limit, label, color in AQI_CATEGORIES:
        if aqi <= limit:
            return {"label": label, "color": color}
    return {"label": "Hazardous", "color": "#6b21a8"}


def get_statistics() -> dict:
    df = pd.DataFrame(AIR_QUALITY)
    numerics = ["PM25", "PM10", "NO2", "O3", "AQI", "CO"]

    stats_result = {}
    for col in numerics:
        s = df[col]
        stats_result[col] = {
            "mean":   round(float(s.mean()), 2),
            "median": round(float(s.median()), 2),
            "std":    round(float(s.std()), 2),
            "min":    round(float(s.min()), 2),
            "max":    round(float(s.max()), 2),
            "q25":    round(float(s.quantile(0.25)), 2),
            "q75":    round(float(s.quantile(0.75)), 2),
            "who_limit":      WHO_LIMITS.get(col),
            "violations":     int((s > WHO_LIMITS.get(col, 9999)).sum()),
            "violation_pct":  round(float((s > WHO_LIMITS.get(col, 9999)).mean() * 100), 1),
        }
    return stats_result


def get_correlation_with_health() -> dict:
    df_aq = pd.DataFrame(AIR_QUALITY)
    df_h  = pd.DataFrame(HEALTH)

    results = {}
    for pollutant in ["PM25", "PM10", "NO2", "AQI"]:
        r, p = stats.pearsonr(df_aq[pollutant], df_h["hospitalVisits"])
        results[pollutant] = {
            "r":          round(float(r), 3),
            "p_value":    round(float(p), 4),
            "significant": bool(p < 0.05),
        }
    return results


def get_seasonal_analysis() -> dict:
    df = pd.DataFrame(AIR_QUALITY)
    # Define seasons
    season_map = {
        "Jan":"Winter","Feb":"Winter","Mar":"Spring","Apr":"Spring","May":"Spring",
        "Jun":"Summer","Jul":"Summer","Aug":"Summer","Sep":"Autumn","Oct":"Autumn",
        "Nov":"Autumn","Dec":"Winter",
    }
    df["season"] = df["month"].map(season_map)
    seasonal = df.groupby("season")[["AQI","PM25","PM10","NO2"]].mean().round(2)
    return seasonal.reset_index().to_dict(orient="records")


def get_worst_months() -> list:
    df = pd.DataFrame(AIR_QUALITY)
    worst = df.nlargest(3, "AQI")[["month","AQI","PM25","PM10"]].copy()
    worst["category"] = worst["AQI"].apply(lambda x: get_aqi_category(x)["label"])
    return worst.to_dict(orient="records")


def get_health_impact_score() -> dict:
    """
    Composite score based on WHO exceedances.
    Score 0-100: higher = worse air quality impact on health.
    """
    df = pd.DataFrame(AIR_QUALITY)
    weights = {"PM25": 0.35, "PM10": 0.20, "NO2": 0.20, "O3": 0.15, "AQI": 0.10}
    score = 0.0
    for col, weight in weights.items():
        limit = WHO_LIMITS[col]
        exceedance_ratio = float(df[col].mean()) / limit
        score += min(exceedance_ratio, 3.0) * weight * 33.33
    return {
        "score":      round(min(score, 100), 1),
        "label":      "High Risk" if score > 60 else "Moderate Risk" if score > 30 else "Low Risk",
        "breakdown":  {col: round(float(df[col].mean()) / WHO_LIMITS[col], 2) for col in weights},
    }
