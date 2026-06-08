"""
Anomaly Detection Module
- Z-score based statistical outlier detection
- IQR-based anomaly flagging
- Multi-metric anomaly summary
- Severity classification
- Returns enriched anomaly records
"""

import pandas as pd
import numpy as np
from data.seed_data import AIR_QUALITY, CRIME, HEALTH, NOISE, ECONOMIC, ANOMALIES


def zscore_anomalies(df: pd.DataFrame, col: str, threshold: float = 2.0, label: str = "") -> list:
    """Return rows where z-score > threshold."""
    mean = df[col].mean()
    std  = df[col].std()
    if std == 0:
        return []
    df = df.copy()
    df["z_score"] = ((df[col] - mean) / std).round(3)
    df["deviation_pct"] = ((df[col] - mean) / mean * 100).round(1)
    outliers = df[df["z_score"].abs() > threshold].copy()
    outliers["metric"]    = label or col
    outliers["direction"] = outliers["z_score"].apply(lambda z: "spike" if z > 0 else "drop")
    return outliers.to_dict(orient="records")


def iqr_bounds(series: pd.Series) -> tuple:
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr


def get_statistical_anomalies() -> dict:
    """Run z-score anomaly detection across all datasets."""
    df_aq   = pd.DataFrame(AIR_QUALITY)
    df_cr   = pd.DataFrame(CRIME)
    df_he   = pd.DataFrame(HEALTH)
    df_no   = pd.DataFrame(NOISE)
    df_ec   = pd.DataFrame(ECONOMIC)

    return {
        "air_quality": {
            "AQI":  zscore_anomalies(df_aq, "AQI",  1.5, "AQI"),
            "PM25": zscore_anomalies(df_aq, "PM25", 1.5, "PM2.5"),
        },
        "crime": {
            "total":   zscore_anomalies(df_cr, "total",   1.5, "Total Crime"),
            "assault": zscore_anomalies(df_cr, "assault", 1.5, "Assault"),
        },
        "health": {
            "hospitalVisits":    zscore_anomalies(df_he, "hospitalVisits",    1.5, "Hospital Visits"),
            "respiratoryIssues": zscore_anomalies(df_he, "respiratoryIssues", 1.5, "Respiratory"),
        },
        "noise": {
            "complaints": zscore_anomalies(df_no, "complaints", 1.5, "Noise Complaints"),
        },
        "economic": {
            "unemployment": zscore_anomalies(df_ec, "unemployment", 1.5, "Unemployment"),
        },
    }


def get_enriched_anomalies() -> list:
    """Return the known anomaly records with computed deviation stats."""
    enriched = []
    for a in ANOMALIES:
        deviation = round((a["value"] - a["threshold"]) / a["threshold"] * 100, 1)
        enriched.append({
            **a,
            "deviation_pct": deviation,
            "severity_score": {
                "critical": 4, "high": 3, "medium": 2, "low": 1
            }.get(a["severity"], 1),
        })
    return enriched


def get_anomaly_summary() -> dict:
    alerts = ANOMALIES
    by_severity = {}
    for a in alerts:
        by_severity[a["severity"]] = by_severity.get(a["severity"], 0) + 1

    by_metric = {}
    for a in alerts:
        by_metric[a["metric"]] = by_metric.get(a["metric"], 0) + 1

    return {
        "total_alerts":    len(alerts),
        "by_severity":     by_severity,
        "by_metric":       by_metric,
        "active_alerts":   [a for a in alerts if a["severity"] in ("critical", "high")],
        "critical_count":  by_severity.get("critical", 0),
        "high_count":      by_severity.get("high", 0),
    }
