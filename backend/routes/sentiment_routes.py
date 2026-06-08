from fastapi import APIRouter
import pandas as pd
from data.seed_data import SENTIMENT, SENTIMENT_TREND, CITIZEN_REPORTS

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment"])


@router.get("/")
def sentiment_data():
    return {"data": SENTIMENT, "count": len(SENTIMENT)}


@router.get("/trend")
def sentiment_trend():
    return {"data": SENTIMENT_TREND}


@router.get("/reports")
def citizen_reports():
    return {"data": CITIZEN_REPORTS, "count": len(CITIZEN_REPORTS)}


@router.get("/summary")
def sentiment_summary():
    df = pd.DataFrame(SENTIMENT)
    overall_positive = round(float(df["positive"].mean()), 1)
    overall_negative = round(float(df["negative"].mean()), 1)
    overall_neutral  = round(float(df["neutral"].mean()), 1)

    best  = df.loc[df["positive"].idxmax()]
    worst = df.loc[df["negative"].idxmax()]

    total_responses = int(df["total"].sum())

    improving = df[df["trend"] > 0]["category"].tolist()
    declining = df[df["trend"] < 0]["category"].tolist()

    return {
        "overall_positive": overall_positive,
        "overall_negative": overall_negative,
        "overall_neutral":  overall_neutral,
        "total_responses":  total_responses,
        "best_category":    {"name": best["category"], "positive": int(best["positive"])},
        "worst_category":   {"name": worst["category"], "negative": int(worst["negative"])},
        "improving_categories": improving,
        "declining_categories": declining,
        "net_sentiment_score":  round(overall_positive - overall_negative, 1),
    }
