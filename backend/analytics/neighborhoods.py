"""
Neighborhood Analysis Module
- Composite livability scoring
- Dimension-wise ranking
- Zone aggregation
- Gap analysis (best vs worst per metric)
"""

import pandas as pd
import numpy as np
from data.seed_data import NEIGHBORHOOD_SCORES, NEIGHBORHOODS


METRIC_WEIGHTS = {
    "airQuality":   0.18,
    "safety":       0.20,
    "greenSpace":   0.12,
    "healthcare":   0.18,
    "economic":     0.15,
    "noise":        0.10,
    "transport":    0.07,
}


def get_all_scores() -> list:
    df = pd.DataFrame(NEIGHBORHOOD_SCORES)
    # Recompute weighted livability score
    df["weightedScore"] = sum(
        df[m] * w for m, w in METRIC_WEIGHTS.items()
    ).round(1)
    df["rank"] = df["weightedScore"].rank(ascending=False, method="min").astype(int)
    df["grade"] = df["weightedScore"].apply(
        lambda s: "A" if s >= 75 else "B" if s >= 60 else "C" if s >= 45 else "D"
    )
    return df.to_dict(orient="records")


def get_rankings_by_metric() -> dict:
    df = pd.DataFrame(NEIGHBORHOOD_SCORES)
    metrics = list(METRIC_WEIGHTS.keys())
    result = {}
    for m in metrics:
        ranked = df.nlargest(8, m)[["name", m]].copy()
        ranked["rank"] = range(1, len(ranked) + 1)
        result[m] = ranked.to_dict(orient="records")
    return result


def get_zone_summary() -> list:
    df_scores = pd.DataFrame(NEIGHBORHOOD_SCORES)
    df_info   = pd.DataFrame(NEIGHBORHOODS)
    merged = df_scores.merge(df_info[["id","zone","population"]], on="id")
    zone_summary = merged.groupby("zone").agg(
        avgLivability=("livabilityScore", "mean"),
        totalPopulation=("population", "sum"),
        neighborhoods=("name", "count"),
    ).round(1).reset_index()
    zone_summary["avgLivability"] = zone_summary["avgLivability"].round(1)
    return zone_summary.to_dict(orient="records")


def get_gap_analysis() -> dict:
    df = pd.DataFrame(NEIGHBORHOOD_SCORES)
    metrics = list(METRIC_WEIGHTS.keys())
    gaps = {}
    for m in metrics:
        best  = df.loc[df[m].idxmax()]
        worst = df.loc[df[m].idxmin()]
        gaps[m] = {
            "best":  {"name": best["name"],  "score": int(best[m])},
            "worst": {"name": worst["name"], "score": int(worst[m])},
            "gap":   int(best[m] - worst[m]),
        }
    return gaps


def get_improvement_priorities() -> list:
    """Identify metrics with the most improvement potential per neighborhood."""
    df = pd.DataFrame(NEIGHBORHOOD_SCORES)
    priorities = []
    for _, row in df.iterrows():
        weakest_metric = min(METRIC_WEIGHTS.keys(), key=lambda m: row[m])
        priorities.append({
            "neighborhood":    row["name"],
            "livabilityScore": row["livabilityScore"],
            "weakest_metric":  weakest_metric,
            "weakest_score":   int(row[weakest_metric]),
            "potential_gain":  int(100 - row[weakest_metric]),
        })
    priorities.sort(key=lambda x: x["potential_gain"], reverse=True)
    return priorities
