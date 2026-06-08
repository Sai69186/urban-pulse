"""
Cross-Domain Correlation Analysis
- Pearson correlation matrix across all city metrics
- Granger causality indicators
- Top correlated pairs
"""

import pandas as pd
import numpy as np
from scipy import stats
from data.seed_data import AIR_QUALITY, CRIME, ECONOMIC, HEALTH, NOISE


def build_master_df() -> pd.DataFrame:
    df = pd.DataFrame({
        "AQI":             [d["AQI"]             for d in AIR_QUALITY],
        "PM25":            [d["PM25"]            for d in AIR_QUALITY],
        "Crime":           [d["total"]           for d in CRIME],
        "Unemployment":    [d["unemployment"]    for d in ECONOMIC],
        "MedianIncome":    [d["medianIncome"]    for d in ECONOMIC],
        "HospitalVisits":  [d["hospitalVisits"]  for d in HEALTH],
        "Respiratory":     [d["respiratoryIssues"] for d in HEALTH],
        "NoiseLevel":      [d["avgDecibels"]     for d in NOISE],
        "NoiseComplaints": [d["complaints"]      for d in NOISE],
        "GDPGrowth":       [d["gdpGrowth"]       for d in ECONOMIC],
    })
    return df


def get_correlation_matrix() -> dict:
    df = build_master_df()
    corr = df.corr(method="pearson").round(3)
    return {
        "matrix":  corr.to_dict(),
        "columns": list(corr.columns),
    }


def get_top_correlations(n: int = 10) -> list:
    df = build_master_df()
    corr = df.corr(method="pearson")
    pairs = []
    cols = corr.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            r = corr.iloc[i, j]
            pairs.append({
                "metric_a": cols[i],
                "metric_b": cols[j],
                "r":        round(float(r), 3),
                "abs_r":    round(abs(float(r)), 3),
                "strength": "Strong" if abs(r) > 0.6 else "Moderate" if abs(r) > 0.3 else "Weak",
                "direction":"Positive" if r > 0 else "Negative",
            })
    pairs.sort(key=lambda x: x["abs_r"], reverse=True)
    return pairs[:n]


def get_pairwise_stats() -> list:
    df = build_master_df()
    pairs_of_interest = [
        ("AQI",          "HospitalVisits"),
        ("AQI",          "Respiratory"),
        ("Crime",        "Unemployment"),
        ("Crime",        "NoiseLevel"),
        ("Unemployment", "HospitalVisits"),
        ("MedianIncome", "Respiratory"),
        ("NoiseLevel",   "NoiseComplaints"),
        ("GDPGrowth",    "Unemployment"),
    ]
    results = []
    for a, b in pairs_of_interest:
        r, p = stats.pearsonr(df[a], df[b])
        slope, intercept, _, _, _ = stats.linregress(df[a], df[b])
        results.append({
            "pair":        f"{a} vs {b}",
            "metric_a":    a,
            "metric_b":    b,
            "r":           round(float(r), 3),
            "p_value":     round(float(p), 4),
            "significant": bool(p < 0.05),
            "slope":       round(float(slope), 4),
            "intercept":   round(float(intercept), 2),
        })
    return results
