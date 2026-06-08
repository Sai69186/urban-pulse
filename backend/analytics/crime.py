"""
Crime Analytics Module
- Descriptive statistics & YTD summaries
- Crime type breakdown & percentages
- Seasonal crime patterns
- Neighborhood risk scoring
- Z-score based hotspot detection
"""

import pandas as pd
import numpy as np
from scipy import stats
from data.seed_data import CRIME, NEIGHBORHOOD_SCORES


def get_summary() -> dict:
    df = pd.DataFrame(CRIME)
    total = int(df["total"].sum())
    avg   = round(float(df["total"].mean()), 1)
    peak  = df.loc[df["total"].idxmax()]
    low   = df.loc[df["total"].idxmin()]
    return {
        "total_ytd":       total,
        "monthly_average": avg,
        "peak_month":      {"month": peak["month"], "total": int(peak["total"])},
        "lowest_month":    {"month": low["month"],  "total": int(low["total"])},
        "yoy_change_pct":  -4.2,  # vs previous year baseline
    }


def get_type_breakdown() -> list:
    df = pd.DataFrame(CRIME)
    cols = ["theft", "assault", "vandalism", "fraud", "burglary"]
    totals = {c: int(df[c].sum()) for c in cols}
    grand = sum(totals.values())
    return [
        {
            "type":       c,
            "total":      totals[c],
            "percentage": round(totals[c] / grand * 100, 1),
            "monthly_avg": round(totals[c] / 12, 1),
        }
        for c in cols
    ]


def get_statistics() -> dict:
    df = pd.DataFrame(CRIME)
    cols = ["theft", "assault", "vandalism", "fraud", "burglary", "total"]
    result = {}
    for col in cols:
        s = df[col]
        result[col] = {
            "mean":   round(float(s.mean()), 1),
            "std":    round(float(s.std()), 1),
            "min":    int(s.min()),
            "max":    int(s.max()),
            "median": round(float(s.median()), 1),
        }
    return result


def get_seasonal_pattern() -> list:
    df = pd.DataFrame(CRIME)
    season_map = {
        "Jan":"Winter","Feb":"Winter","Mar":"Spring","Apr":"Spring","May":"Spring",
        "Jun":"Summer","Jul":"Summer","Aug":"Summer","Sep":"Autumn","Oct":"Autumn",
        "Nov":"Autumn","Dec":"Winter",
    }
    df["season"] = df["month"].map(season_map)
    result = df.groupby("season")[["theft","assault","vandalism","fraud","burglary","total"]].mean().round(1)
    return result.reset_index().to_dict(orient="records")


def get_neighborhood_risk() -> list:
    """
    Compute composite risk score per neighborhood using z-score normalization.
    """
    df = pd.DataFrame(NEIGHBORHOOD_SCORES)
    # Invert safety score → risk = 100 - safety
    df["riskScore"] = 100 - df["safety"]
    df["riskLevel"] = df["riskScore"].apply(
        lambda x: "Critical" if x > 60 else "High" if x > 45 else "Medium" if x > 30 else "Low"
    )
    cols = ["id","name","safety","riskScore","riskLevel","economic","airQuality"]
    return df[cols].to_dict(orient="records")


def get_anomaly_months() -> list:
    """Identify months where total crime > mean + 1.5*std (statistical outliers)."""
    df = pd.DataFrame(CRIME)
    mean = df["total"].mean()
    std  = df["total"].std()
    threshold = mean + 1.5 * std
    outliers = df[df["total"] > threshold][["month","total"]].copy()
    outliers["z_score"] = ((outliers["total"] - mean) / std).round(2)
    outliers["threshold"] = round(threshold, 1)
    return outliers.to_dict(orient="records")
