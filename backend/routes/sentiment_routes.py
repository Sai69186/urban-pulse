from fastapi import APIRouter
from data.seed_data import SENTIMENT, SENTIMENT_TREND, CITIZEN_REPORTS
from data.session_store import get_dataset
import pandas as pd

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment"])

def _se(): return get_dataset("sentiment", SENTIMENT)

@router.get("/")
def sentiment_data():
    d = _se(); return {"data": d, "count": len(d)}

@router.get("/trend")
def sentiment_trend():
    return {"data": SENTIMENT_TREND}

@router.get("/reports")
def citizen_reports():
    return {"data": CITIZEN_REPORTS, "count": len(CITIZEN_REPORTS)}

@router.get("/summary")
def sentiment_summary():
    df = pd.DataFrame(_se())
    pos = round(float(df["positive"].mean()),1) if "positive" in df.columns else 0
    neg = round(float(df["negative"].mean()),1) if "negative" in df.columns else 0
    neu = round(float(df["neutral"].mean()),1)  if "neutral"  in df.columns else 0
    best  = df.loc[df["positive"].idxmax()] if "positive" in df.columns else pd.Series()
    worst = df.loc[df["negative"].idxmax()] if "negative" in df.columns else pd.Series()
    total = int(df["total"].sum()) if "total" in df.columns else 0
    improving = df[df["trend"]>0]["category"].tolist() if "trend" in df.columns and "category" in df.columns else []
    declining = df[df["trend"]<0]["category"].tolist() if "trend" in df.columns and "category" in df.columns else []
    return {
        "overall_positive": pos, "overall_negative": neg, "overall_neutral": neu,
        "total_responses":  total,
        "best_category":  {"name":str(best.get("category","")), "positive":int(best.get("positive",0))} if not best.empty else {},
        "worst_category": {"name":str(worst.get("category","")),"negative":int(worst.get("negative",0))} if not worst.empty else {},
        "improving_categories": improving,
        "declining_categories": declining,
        "net_sentiment_score":  round(pos-neg,1),
    }
