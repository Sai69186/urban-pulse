"""
Economic Analytics Module
- Descriptive statistics
- Business net activity (openings - closures)
- GDP growth trend analysis
- Income vs affordability correlation
- Economic health composite score
"""

import pandas as pd
import numpy as np
from scipy import stats
from data.seed_data import ECONOMIC


def get_statistics() -> dict:
    df = pd.DataFrame(ECONOMIC)
    numerics = ["unemployment","medianIncome","businessOpenings","businessClosures",
                "housingAffordability","gdpGrowth"]
    result = {}
    for col in numerics:
        s = df[col]
        result[col] = {
            "mean":   round(float(s.mean()), 2),
            "std":    round(float(s.std()), 2),
            "min":    round(float(s.min()), 2),
            "max":    round(float(s.max()), 2),
            "median": round(float(s.median()), 2),
        }
    return result


def get_business_activity() -> list:
    df = pd.DataFrame(ECONOMIC)
    df["netActivity"]     = df["businessOpenings"] - df["businessClosures"]
    df["cumulativeNet"]   = df["netActivity"].cumsum()
    df["survivalRate"]    = ((df["businessOpenings"] - df["businessClosures"]) / df["businessOpenings"] * 100).round(1)
    return df[["month","businessOpenings","businessClosures","netActivity","cumulativeNet","survivalRate"]].to_dict(orient="records")


def get_income_affordability_correlation() -> dict:
    df = pd.DataFrame(ECONOMIC)
    r, p = stats.pearsonr(df["medianIncome"], df["housingAffordability"])
    return {
        "r":           round(float(r), 3),
        "p_value":     round(float(p), 4),
        "significant": bool(p < 0.05),
        "interpretation": (
            "Strong positive — income growth tracks affordability" if r > 0.6 else
            "Moderate positive correlation" if r > 0.3 else
            "Weak or no correlation"
        ),
    }


def get_gdp_trend() -> dict:
    df = pd.DataFrame(ECONOMIC)
    x = np.arange(len(df))
    slope, intercept, r_value, p_value, _ = stats.linregress(x, df["gdpGrowth"])
    return {
        "trend_slope":    round(float(slope), 4),
        "r_squared":      round(float(r_value ** 2), 3),
        "p_value":        round(float(p_value), 4),
        "trend_direction":"upward" if slope > 0 else "downward",
        "peak_month":     df.loc[df["gdpGrowth"].idxmax(), "month"],
        "peak_value":     float(df["gdpGrowth"].max()),
    }


def get_economic_health_score() -> dict:
    df = pd.DataFrame(ECONOMIC)
    # Normalize each dimension to 0–100
    unemp_score = max(0, 100 - (df["unemployment"].mean() - 3) / 10 * 100)
    income_score = min(100, (df["medianIncome"].mean() - 30000) / 70000 * 100)
    afford_score = float(df["housingAffordability"].mean())
    gdp_score    = min(100, df["gdpGrowth"].mean() / 5 * 100)

    composite = round((unemp_score * 0.30 + income_score * 0.30 + afford_score * 0.25 + gdp_score * 0.15), 1)
    return {
        "composite_score":   composite,
        "unemployment_score": round(unemp_score, 1),
        "income_score":       round(income_score, 1),
        "affordability_score":round(afford_score, 1),
        "gdp_score":          round(gdp_score, 1),
        "label": "Strong" if composite > 65 else "Moderate" if composite > 45 else "Weak",
    }
