from fastapi import APIRouter
from data.seed_data import AIR_QUALITY, HEALTH
from data.session_store import get_dataset
import pandas as pd
from scipy import stats as scipy_stats
from analytics.air_quality import get_aqi_category

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])

WHO = {"PM25":15,"PM10":45,"NO2":10,"O3":100,"AQI":50,"CO":4.0}

def _aq(): return get_dataset("air_quality", AIR_QUALITY)
def _he(): return get_dataset("health", HEALTH)

@router.get("/")
def air_quality_data():
    d = _aq()
    return {"data": d, "count": len(d)}

@router.get("/statistics")
def air_quality_statistics():
    df = pd.DataFrame(_aq())
    result = {}
    for col in [c for c in ["PM25","PM10","NO2","O3","AQI","CO"] if c in df.columns]:
        s = df[col]
        limit = WHO.get(col, 9999)
        result[col] = {
            "mean": round(float(s.mean()),2), "median": round(float(s.median()),2),
            "std":  round(float(s.std()),2),  "min":    round(float(s.min()),2),
            "max":  round(float(s.max()),2),  "q25":    round(float(s.quantile(.25)),2),
            "q75":  round(float(s.quantile(.75)),2),
            "who_limit": limit,
            "violations": int((s > limit).sum()),
            "violation_pct": round(float((s > limit).mean()*100),1),
        }
    return result

@router.get("/health-correlation")
def health_correlation():
    df_aq = pd.DataFrame(_aq())
    df_he = pd.DataFrame(_he())
    n = min(len(df_aq), len(df_he))
    results = {}
    for p in [c for c in ["PM25","PM10","NO2","AQI"] if c in df_aq.columns]:
        if "hospitalVisits" in df_he.columns:
            r, pv = scipy_stats.pearsonr(df_aq[p].iloc[:n], df_he["hospitalVisits"].iloc[:n])
            results[p] = {"r": round(float(r),3), "p_value": round(float(pv),4), "significant": bool(pv<0.05)}
    return results

@router.get("/seasonal")
def seasonal_analysis():
    df = pd.DataFrame(_aq())
    sm = {"Jan":"Winter","Feb":"Winter","Mar":"Spring","Apr":"Spring","May":"Spring",
          "Jun":"Summer","Jul":"Summer","Aug":"Summer","Sep":"Autumn","Oct":"Autumn","Nov":"Autumn","Dec":"Winter"}
    if "month" in df.columns:
        df["season"] = df["month"].map(sm).fillna("Unknown")
        cols = [c for c in ["AQI","PM25","PM10","NO2"] if c in df.columns]
        return df.groupby("season")[cols].mean().round(2).reset_index().to_dict(orient="records")
    return []

@router.get("/worst-months")
def worst_months():
    df = pd.DataFrame(_aq())
    if "AQI" not in df.columns: return []
    worst = df.nlargest(3,"AQI")[["month","AQI"] + [c for c in ["PM25","PM10"] if c in df.columns]].copy()
    worst["category"] = worst["AQI"].apply(lambda x: get_aqi_category(x)["label"])
    return worst.to_dict(orient="records")

@router.get("/health-impact-score")
def health_impact_score():
    df = pd.DataFrame(_aq())
    weights = {k:v for k,v in {"PM25":0.35,"PM10":0.20,"NO2":0.20,"O3":0.15,"AQI":0.10}.items() if k in df.columns}
    if not weights: return {"score":0,"label":"No data","breakdown":{}}
    score = sum(min(float(df[c].mean())/WHO[c],3)*w*33.33 for c,w in weights.items())
    score = round(min(score,100),1)
    return {
        "score": score,
        "label": "High Risk" if score>60 else "Moderate Risk" if score>30 else "Low Risk",
        "breakdown": {c: round(float(df[c].mean())/WHO[c],2) for c in weights},
    }
