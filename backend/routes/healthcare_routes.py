from fastapi import APIRouter
from data.seed_data import HEALTH, AIR_QUALITY
from data.session_store import get_dataset
import pandas as pd
from scipy import stats as scipy_stats

router = APIRouter(prefix="/api/healthcare", tags=["Healthcare"])

def _he(): return get_dataset("health", HEALTH)
def _aq(): return get_dataset("air_quality", AIR_QUALITY)

@router.get("/")
def healthcare_data():
    d = _he(); return {"data": d, "count": len(d)}

@router.get("/statistics")
def healthcare_statistics():
    df = pd.DataFrame(_he())
    cols = [c for c in ["hospitalVisits","respiratoryIssues","mentalHealthCases","avgResponseTime","vaccinationRate","icuOccupancy"] if c in df.columns]
    return {c:{"mean":round(float(df[c].mean()),2),"std":round(float(df[c].std()),2),"min":round(float(df[c].min()),2),"max":round(float(df[c].max()),2),"median":round(float(df[c].median()),2)} for c in cols}

@router.get("/icu-analysis")
def icu_analysis():
    df = pd.DataFrame(_he())
    if "icuOccupancy" not in df.columns: return {"avg_occupancy":0,"max_occupancy":0,"months_above_threshold":[],"warning":"No ICU data"}
    above = df[df["icuOccupancy"]>80][["month","icuOccupancy","hospitalVisits"] if "hospitalVisits" in df.columns else ["month","icuOccupancy"]]
    return {"avg_occupancy":round(float(df["icuOccupancy"].mean()),1),"max_occupancy":int(df["icuOccupancy"].max()),"critical_threshold":80,"months_above_threshold":above.to_dict(orient="records"),"warning":"ICU critical in winter" if df["icuOccupancy"].max()>85 else "Within range"}

@router.get("/respiratory-aqi-correlation")
def respiratory_aqi():
    df_h = pd.DataFrame(_he()); df_aq = pd.DataFrame(_aq())
    if "respiratoryIssues" not in df_h.columns or "AQI" not in df_aq.columns:
        return {"error":"Missing columns"}
    n = min(len(df_h),len(df_aq))
    r,p = scipy_stats.pearsonr(df_aq["AQI"].iloc[:n], df_h["respiratoryIssues"].iloc[:n])
    scatter = [{"aqi":int(df_aq.loc[i,"AQI"]),"cases":int(df_h.loc[i,"respiratoryIssues"]),"month":str(df_h.loc[i].get("month",""))} for i in range(n)]
    return {"correlation_r":round(float(r),3),"p_value":round(float(p),4),"significant":bool(p<0.05),"scatter_data":scatter,"interpretation":f"r={round(r,3)} — {'Strong' if abs(r)>0.6 else 'Moderate'} correlation"}

@router.get("/response-time-benchmark")
def response_time():
    df = pd.DataFrame(_he())
    if "avgResponseTime" not in df.columns: return {"error":"No avgResponseTime column"}
    target = 10.0
    above = df[df["avgResponseTime"]>target]
    return {"target_minutes":target,"current_avg":round(float(df["avgResponseTime"].mean()),1),"best_month":str(df.loc[df["avgResponseTime"].idxmin()].get("month","")),"worst_month":str(df.loc[df["avgResponseTime"].idxmax()].get("month","")),"months_above_target":above[["month","avgResponseTime"]].to_dict(orient="records") if "month" in df.columns else [],"compliance_rate":round(float((df["avgResponseTime"]<=target).mean()*100),1)}

@router.get("/public-health-score")
def public_health_score():
    df = pd.DataFrame(_he())
    rt  = float(df["avgResponseTime"].mean()) if "avgResponseTime" in df.columns else 12
    vax = float(df["vaccinationRate"].mean())  if "vaccinationRate"  in df.columns else 70
    icu = float(df["icuOccupancy"].mean())     if "icuOccupancy"     in df.columns else 70
    rt_s  = max(0,100-(rt-10)*10)
    icu_s = max(0,100-icu)
    comp  = round(rt_s*0.35 + vax*0.40 + icu_s*0.25, 1)
    return {"composite_score":comp,"response_time_score":round(rt_s,1),"vaccination_score":round(vax,1),"icu_availability_score":round(icu_s,1),"label":"Good" if comp>65 else "Fair" if comp>45 else "Poor"}
