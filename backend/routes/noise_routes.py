from fastapi import APIRouter
from data.seed_data import NOISE
from data.session_store import get_dataset
import pandas as pd
from scipy import stats as scipy_stats
import numpy as np

router = APIRouter(prefix="/api/noise", tags=["Noise"])
WHO_DAY = 53; WHO_NIGHT = 45

def _no(): return get_dataset("noise", NOISE)

@router.get("/")
def noise_data():
    d = _no(); return {"data": d, "count": len(d)}

@router.get("/statistics")
def noise_statistics():
    df = pd.DataFrame(_no())
    cols = [c for c in ["avgDecibels","complaints","nighttimeNoise","constructionNoise","trafficNoise"] if c in df.columns]
    return {c:{"mean":round(float(df[c].mean()),2),"std":round(float(df[c].std()),2),"min":round(float(df[c].min()),2),"max":round(float(df[c].max()),2),"median":round(float(df[c].median()),2)} for c in cols}

@router.get("/who-violations")
def who_violations():
    df = pd.DataFrame(_no())
    dv = df[df["avgDecibels"]>WHO_DAY] if "avgDecibels" in df.columns else pd.DataFrame()
    nv = df[df["nighttimeNoise"]>WHO_NIGHT] if "nighttimeNoise" in df.columns else pd.DataFrame()
    return {"who_day_limit":WHO_DAY,"who_night_limit":WHO_NIGHT,"day_violations":{"count":len(dv),"months":dv[["month","avgDecibels"]].to_dict(orient="records") if not dv.empty and "month" in dv.columns else []},"night_violations":{"count":len(nv),"months":nv[["month","nighttimeNoise"]].to_dict(orient="records") if not nv.empty and "month" in nv.columns else []}}

@router.get("/source-breakdown")
def source_breakdown():
    df = pd.DataFrame(_no())
    return {"avg_construction":round(float(df["constructionNoise"].mean()),1) if "constructionNoise" in df.columns else 0,"avg_traffic":round(float(df["trafficNoise"].mean()),1) if "trafficNoise" in df.columns else 0,"avg_nighttime":round(float(df["nighttimeNoise"].mean()),1) if "nighttimeNoise" in df.columns else 0,"total_complaints":int(df["complaints"].sum()) if "complaints" in df.columns else 0,"peak_complaint_month":str(df.loc[df["complaints"].idxmax()].get("month","")) if "complaints" in df.columns else ""}

@router.get("/complaint-trend")
def complaint_trend():
    df = pd.DataFrame(_no())
    if "complaints" not in df.columns: return {"data":[],"trend_slope":0,"trend_direction":"flat"}
    x = np.arange(len(df))
    slope,_,r,p,_ = scipy_stats.linregress(x, df["complaints"])
    return {"data":df[["month","complaints"]].to_dict(orient="records") if "month" in df.columns else df[["complaints"]].to_dict(orient="records"),"trend_slope":round(float(slope),2),"trend_direction":"increasing" if slope>0 else "decreasing","r_squared":round(float(r**2),3)}
