from fastapi import APIRouter
from data.seed_data import NEIGHBORHOOD_SCORES, NEIGHBORHOODS
from data.session_store import get_dataset
import pandas as pd

router = APIRouter(prefix="/api/neighborhoods", tags=["Neighborhoods"])

WEIGHTS = {"airQuality":0.18,"safety":0.20,"greenSpace":0.12,"healthcare":0.18,"economic":0.15,"noise":0.10,"transport":0.07}

def _nb(): return get_dataset("neighborhoods", NEIGHBORHOOD_SCORES)

@router.get("/")
def neighborhoods_data():
    d = _nb(); return {"data": d, "count": len(d)}

@router.get("/scores")
def all_scores():
    df = pd.DataFrame(_nb())
    avail_w = {m:w for m,w in WEIGHTS.items() if m in df.columns}
    if avail_w:
        df["weightedScore"] = sum(df[m]*w for m,w in avail_w.items()).round(1)
    df["rank"]  = df["weightedScore"].rank(ascending=False,method="min").astype(int) if "weightedScore" in df.columns else range(1,len(df)+1)
    df["grade"] = df["weightedScore"].apply(lambda s:"A" if s>=75 else "B" if s>=60 else "C" if s>=45 else "D") if "weightedScore" in df.columns else "C"
    return df.to_dict(orient="records")

@router.get("/rankings")
def rankings():
    df = pd.DataFrame(_nb())
    result = {}
    for m in WEIGHTS:
        if m in df.columns and "name" in df.columns:
            ranked = df.nlargest(min(8,len(df)),m)[["name",m]].copy()
            ranked["rank"] = range(1,len(ranked)+1)
            result[m] = ranked.to_dict(orient="records")
    return result

@router.get("/zones")
def zones():
    df = pd.DataFrame(_nb())
    info = pd.DataFrame(NEIGHBORHOODS)
    if "id" in df.columns and "id" in info.columns:
        merged = df.merge(info[["id","zone","population"]], on="id", how="left")
        if "zone" in merged.columns:
            agg = merged.groupby("zone").agg(avgLivability=("livabilityScore","mean"),totalPopulation=("population","sum"),neighborhoods=("name","count")).round(1).reset_index()
            return agg.to_dict(orient="records")
    return []

@router.get("/gap-analysis")
def gap_analysis():
    df = pd.DataFrame(_nb())
    result = {}
    for m in WEIGHTS:
        if m in df.columns and "name" in df.columns:
            best  = df.loc[df[m].idxmax()]
            worst = df.loc[df[m].idxmin()]
            result[m] = {"best":{"name":str(best["name"]),"score":int(best[m])},"worst":{"name":str(worst["name"]),"score":int(worst[m])},"gap":int(best[m]-worst[m])}
    return result

@router.get("/improvement-priorities")
def improvement_priorities():
    df = pd.DataFrame(_nb())
    avail = [m for m in WEIGHTS if m in df.columns]
    if not avail or "name" not in df.columns: return []
    result = []
    for _,row in df.iterrows():
        weakest = min(avail, key=lambda m: row[m])
        score = row.get("weightedScore", row.get("livabilityScore", 0))
        result.append({"neighborhood":str(row["name"]),"livabilityScore":round(float(score),1),"weakest_metric":weakest,"weakest_score":int(row[weakest]),"potential_gain":int(100-row[weakest])})
    return sorted(result, key=lambda x:x["potential_gain"], reverse=True)

@router.get("/{neighborhood_id}")
def neighborhood_detail(neighborhood_id: int):
    data = _nb()
    match = next((n for n in data if n.get("id") == neighborhood_id), None)
    return match or {"error": "Not found"}
