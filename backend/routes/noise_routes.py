from fastapi import APIRouter
import pandas as pd
from data.seed_data import NOISE
from scipy import stats

router = APIRouter(prefix="/api/noise", tags=["Noise"])

WHO_DAY_LIMIT   = 53
WHO_NIGHT_LIMIT = 45


@router.get("/")
def noise_data():
    return {"data": NOISE, "count": len(NOISE)}


@router.get("/statistics")
def noise_statistics():
    df = pd.DataFrame(NOISE)
    cols = ["avgDecibels","complaints","nighttimeNoise","constructionNoise","trafficNoise"]
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


@router.get("/who-violations")
def who_violations():
    df = pd.DataFrame(NOISE)
    day_violations   = df[df["avgDecibels"]    > WHO_DAY_LIMIT]
    night_violations = df[df["nighttimeNoise"] > WHO_NIGHT_LIMIT]
    return {
        "who_day_limit":   WHO_DAY_LIMIT,
        "who_night_limit": WHO_NIGHT_LIMIT,
        "day_violations": {
            "count":   len(day_violations),
            "months":  day_violations[["month","avgDecibels"]].to_dict(orient="records"),
        },
        "night_violations": {
            "count":   len(night_violations),
            "months":  night_violations[["month","nighttimeNoise"]].to_dict(orient="records"),
        },
    }


@router.get("/source-breakdown")
def source_breakdown():
    df = pd.DataFrame(NOISE)
    return {
        "avg_construction": round(float(df["constructionNoise"].mean()), 1),
        "avg_traffic":      round(float(df["trafficNoise"].mean()), 1),
        "avg_nighttime":    round(float(df["nighttimeNoise"].mean()), 1),
        "total_complaints": int(df["complaints"].sum()),
        "peak_complaint_month": df.loc[df["complaints"].idxmax(), "month"],
    }


@router.get("/complaint-trend")
def complaint_trend():
    df = pd.DataFrame(NOISE)
    x = list(range(len(df)))
    slope, intercept, r_value, p_value, _ = stats.linregress(x, df["complaints"])
    return {
        "data":          df[["month","complaints"]].to_dict(orient="records"),
        "trend_slope":   round(float(slope), 2),
        "trend_direction": "increasing" if slope > 0 else "decreasing",
        "r_squared":     round(float(r_value**2), 3),
    }
