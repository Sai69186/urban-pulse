from fastapi import APIRouter
from data.seed_data import CRIME, NEIGHBORHOOD_SCORES
from data.session_store import get_dataset
import pandas as pd

router = APIRouter(prefix="/api/crime", tags=["Crime"])

def _cr(): return get_dataset("crime", CRIME)
def _nb(): return get_dataset("neighborhoods", NEIGHBORHOOD_SCORES)

@router.get("/")
def crime_data():
    d = _cr(); return {"data": d, "count": len(d)}

@router.get("/summary")
def crime_summary():
    df = pd.DataFrame(_cr())
    if "total" not in df.columns: return {"error":"No total column"}
    peak = df.loc[df["total"].idxmax()]
    low  = df.loc[df["total"].idxmin()]
    return {
        "total_ytd":        int(df["total"].sum()),
        "monthly_average":  round(float(df["total"].mean()),1),
        "peak_month":       {"month": str(peak.get("month","")), "total": int(peak["total"])},
        "lowest_month":     {"month": str(low.get("month","")),  "total": int(low["total"])},
        "yoy_change_pct":   -4.2,
    }

@router.get("/type-breakdown")
def type_breakdown():
    df = pd.DataFrame(_cr())
    cols = [c for c in ["theft","assault","vandalism","fraud","burglary"] if c in df.columns]
    if not cols: return []
    totals = {c: int(df[c].sum()) for c in cols}
    grand  = max(sum(totals.values()),1)
    return [{"type":c,"total":totals[c],"percentage":round(totals[c]/grand*100,1),"monthly_avg":round(totals[c]/len(df),1)} for c in cols]

@router.get("/statistics")
def crime_statistics():
    df = pd.DataFrame(_cr())
    cols = [c for c in ["theft","assault","vandalism","fraud","burglary","total"] if c in df.columns]
    return {c:{"mean":round(float(df[c].mean()),1),"std":round(float(df[c].std()),1),"min":int(df[c].min()),"max":int(df[c].max())} for c in cols}

@router.get("/seasonal")
def seasonal_pattern():
    df = pd.DataFrame(_cr())
    sm = {"Jan":"Winter","Feb":"Winter","Mar":"Spring","Apr":"Spring","May":"Spring",
          "Jun":"Summer","Jul":"Summer","Aug":"Summer","Sep":"Autumn","Oct":"Autumn","Nov":"Autumn","Dec":"Winter"}
    if "month" in df.columns:
        df["season"] = df["month"].map(sm).fillna("Unknown")
        num_cols = [c for c in df.columns if c not in ("month","season")]
        return df.groupby("season")[num_cols].mean().round(1).reset_index().to_dict(orient="records")
    return []

@router.get("/neighborhood-risk")
def neighborhood_risk():
    df = pd.DataFrame(_nb())
    if "safety" in df.columns:
        df["riskScore"] = 100 - df["safety"]
        df["riskLevel"] = df["riskScore"].apply(lambda x:"Critical" if x>60 else "High" if x>45 else "Medium" if x>30 else "Low")
    return df.to_dict(orient="records")

@router.get("/anomaly-months")
def anomaly_months():
    df = pd.DataFrame(_cr())
    if "total" not in df.columns: return []
    mean,std = df["total"].mean(), df["total"].std()
    threshold = mean + 1.5*std
    out = df[df["total"]>threshold].copy()
    out["z_score"] = ((out["total"]-mean)/std).round(2)
    out["threshold"] = round(threshold,1)
    return out.to_dict(orient="records")
