"""
Healthcare Analytics Module
- Hospital capacity & ICU utilization
- Illness trend analysis
- AQI vs health correlation
- Response time benchmarking
- Public health composite score
"""

import pandas as pd
import numpy as np
from scipy import stats
from data.seed_data import HEALTH, AIR_QUALITY


def get_statistics() -> dict:
    df = pd.DataFrame(HEALTH)
    cols = ["hospitalVisits","respiratoryIssues","mentalHealthCases",
            "avgResponseTime","vaccinationRate","icuOccupancy"]
    result = {}
    for col in cols:
        s = df[col]
        result[col] = {
            "mean":   round(float(s.mean()), 2),
            "std":    round(float(s.std()), 2),
            "min":    round(float(s.min()), 2),
            "max":    round(float(s.max()), 2),
            "median": round(float(s.median()), 2),
        }
    return result


def get_icu_analysis() -> dict:
    df = pd.DataFrame(HEALTH)
    critical_months = df[df["icuOccupancy"] > 80][["month","icuOccupancy","hospitalVisits"]].copy()
    return {
        "avg_occupancy":       round(float(df["icuOccupancy"].mean()), 1),
        "max_occupancy":       int(df["icuOccupancy"].max()),
        "critical_threshold":  80,
        "months_above_threshold": critical_months.to_dict(orient="records"),
        "warning": "ICU capacity critically high in winter months" if df["icuOccupancy"].max() > 85 else "Within acceptable range",
    }


def get_respiratory_vs_aqi() -> dict:
    df_h  = pd.DataFrame(HEALTH)
    df_aq = pd.DataFrame(AIR_QUALITY)
    r, p  = stats.pearsonr(df_aq["AQI"], df_h["respiratoryIssues"])
    scatter = [
        {"aqi": int(df_aq.loc[i, "AQI"]), "cases": int(df_h.loc[i, "respiratoryIssues"]), "month": df_h.loc[i, "month"]}
        for i in range(len(df_h))
    ]
    return {
        "correlation_r":  round(float(r), 3),
        "p_value":        round(float(p), 4),
        "significant":    bool(p < 0.05),
        "scatter_data":   scatter,
        "interpretation": f"r={round(r,3)} — {'Strong' if abs(r)>0.6 else 'Moderate'} correlation between AQI and respiratory illness",
    }


def get_response_time_benchmark() -> dict:
    df = pd.DataFrame(HEALTH)
    target = 10.0
    above = df[df["avgResponseTime"] > target]
    return {
        "target_minutes":   target,
        "current_avg":      round(float(df["avgResponseTime"].mean()), 1),
        "best_month":       df.loc[df["avgResponseTime"].idxmin(), "month"],
        "worst_month":      df.loc[df["avgResponseTime"].idxmax(), "month"],
        "months_above_target": above[["month","avgResponseTime"]].to_dict(orient="records"),
        "compliance_rate":  round(float((df["avgResponseTime"] <= target).mean() * 100), 1),
    }


def get_public_health_score() -> dict:
    df = pd.DataFrame(HEALTH)
    # Response time score: 100 if <=10 min, decreasing
    rt_score   = max(0, 100 - (df["avgResponseTime"].mean() - 10) * 10)
    vacc_score = float(df["vaccinationRate"].mean())
    icu_score  = max(0, 100 - df["icuOccupancy"].mean())
    composite  = round((rt_score * 0.35 + vacc_score * 0.40 + icu_score * 0.25), 1)
    return {
        "composite_score":       composite,
        "response_time_score":   round(rt_score, 1),
        "vaccination_score":     round(vacc_score, 1),
        "icu_availability_score":round(icu_score, 1),
        "label": "Good" if composite > 65 else "Fair" if composite > 45 else "Poor",
    }
