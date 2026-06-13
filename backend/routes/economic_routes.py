from fastapi import APIRouter
from data.seed_data import ECONOMIC
from data.session_store import get_dataset
import pandas as pd
import numpy as np
from scipy import stats as scipy_stats

router = APIRouter(prefix="/api/economic", tags=["Economic"])

def _ec(): return get_dataset("economic", ECONOMIC)

@router.get("/")
def economic_data():
    d = _ec(); return {"data": d, "count": len(d)}

@router.get("/statistics")
def economic_statistics():
    df = pd.DataFrame(_ec())
    cols = [c for c in ["unemployment","medianIncome","businessOpenings","businessClosures","housingAffordability","gdpGrowth"] if c in df.columns]
    return {c:{"mean":round(float(df[c].mean()),2),"std":round(float(df[c].std()),2),"min":round(float(df[c].min()),2),"max":round(float(df[c].max()),2),"median":round(float(df[c].median()),2)} for c in cols}

@router.get("/business-activity")
def business_activity():
    df = pd.DataFrame(_ec())
    if "businessOpenings" in df.columns and "businessClosures" in df.columns:
        df["netActivity"]   = df["businessOpenings"] - df["businessClosures"]
        df["cumulativeNet"] = df["netActivity"].cumsum()
    return df.to_dict(orient="records")

@router.get("/income-affordability-correlation")
def income_afford():
    df = pd.DataFrame(_ec())
    if "medianIncome" not in df.columns or "housingAffordability" not in df.columns:
        return {"error":"Missing columns"}
    r,p = scipy_stats.pearsonr(df["medianIncome"], df["housingAffordability"])
    return {"r":round(float(r),3),"p_value":round(float(p),4),"significant":bool(p<0.05)}

@router.get("/gdp-trend")
def gdp_trend():
    df = pd.DataFrame(_ec())
    if "gdpGrowth" not in df.columns: return {"error":"No gdpGrowth column"}
    x = np.arange(len(df))
    slope,intercept,r,p,_ = scipy_stats.linregress(x, df["gdpGrowth"])
    return {"trend_slope":round(float(slope),4),"r_squared":round(float(r**2),3),"trend_direction":"upward" if slope>0 else "downward","peak_month":str(df.loc[df["gdpGrowth"].idxmax()].get("month",""))}

@router.get("/health-score")
def economic_health_score():
    df = pd.DataFrame(_ec())
    unemp  = float(df["unemployment"].mean())  if "unemployment"       in df.columns else 7.0
    income = float(df["medianIncome"].mean())   if "medianIncome"       in df.columns else 50000
    afford = float(df["housingAffordability"].mean()) if "housingAffordability" in df.columns else 50
    gdp    = float(df["gdpGrowth"].mean())      if "gdpGrowth"          in df.columns else 2.5
    unemp_s  = max(0, 100-(unemp-3)/10*100)
    income_s = min(100,(income-30000)/70000*100)
    afford_s = afford
    gdp_s    = min(100, gdp/5*100)
    composite = round(unemp_s*0.30 + income_s*0.30 + afford_s*0.25 + gdp_s*0.15, 1)
    return {"composite_score":composite,"unemployment_score":round(unemp_s,1),"income_score":round(income_s,1),"affordability_score":round(afford_s,1),"gdp_score":round(gdp_s,1),"label":"Strong" if composite>65 else "Moderate" if composite>45 else "Weak"}
