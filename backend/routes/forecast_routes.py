import warnings
import numpy as np
from fastapi import APIRouter
from data.seed_data import AIR_QUALITY, CRIME, ECONOMIC, HEALTH, NOISE
from data.session_store import get_dataset
from analytics.correlation import get_top_correlations, get_pairwise_stats

warnings.filterwarnings("ignore")

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

def _fit(series, steps=3):
    arr = np.array(series, dtype=float)
    try:
        from statsmodels.tsa.arima.model import ARIMA
        result = ARIMA(arr, order=(1,1,1)).fit()
        fc = result.get_forecast(steps=steps)
        mean_fc  = fc.predicted_mean
        conf_int = fc.conf_int(alpha=0.05)
        fitted = result.fittedvalues
        mape = float(np.mean(np.abs((arr[1:]-fitted[1:])/np.where(arr[1:]==0,1,arr[1:])))*100)
        return {"success":True,"forecast":[round(float(v),2) for v in mean_fc],"upper":[round(float(v),2) for v in conf_int[:,1]],"lower":[round(float(v),2) for v in conf_int[:,0]],"mape":round(mape,2),"aic":round(float(result.aic),2)}
    except Exception as e:
        x = np.arange(len(arr))
        m,b = np.polyfit(x,arr,1)
        fc = [round(float(m*(len(arr)+i)+b),2) for i in range(steps)]
        return {"success":False,"forecast":fc,"upper":[round(v*1.08,2) for v in fc],"lower":[round(v*0.92,2) for v in fc],"mape":None,"aic":None}

@router.get("/")
def all_forecasts():
    import pandas as pd
    metrics = {
        "livability_score": [62,65,68,70,72,73,74,74,73,75,76,78],
        "aqi":              pd.DataFrame(get_dataset("air_quality",AIR_QUALITY))["AQI"].tolist() if "AQI" in pd.DataFrame(get_dataset("air_quality",AIR_QUALITY)).columns else [80]*12,
        "crime_total":      pd.DataFrame(get_dataset("crime",CRIME))["total"].tolist() if "total" in pd.DataFrame(get_dataset("crime",CRIME)).columns else [200]*12,
        "unemployment":     pd.DataFrame(get_dataset("economic",ECONOMIC))["unemployment"].tolist() if "unemployment" in pd.DataFrame(get_dataset("economic",ECONOMIC)).columns else [7]*12,
        "hospital_visits":  pd.DataFrame(get_dataset("health",HEALTH))["hospitalVisits"].tolist() if "hospitalVisits" in pd.DataFrame(get_dataset("health",HEALTH)).columns else [600]*12,
        "noise_decibels":   pd.DataFrame(get_dataset("noise",NOISE))["avgDecibels"].tolist() if "avgDecibels" in pd.DataFrame(get_dataset("noise",NOISE)).columns else [62]*12,
    }
    from statsmodels.tsa.stattools import adfuller
    results = {}
    for name, series in metrics.items():
        if len(series) < 3: continue
        fc = _fit(series)
        try:
            adf = adfuller(series)
            stat_test = {"adf_stat":round(float(adf[0]),4),"p_value":round(float(adf[1]),4),"is_stationary":bool(adf[1]<0.05)}
        except:
            stat_test = {"adf_stat":0,"p_value":1,"is_stationary":False}
        results[name] = {**fc,"historical":series,"stationarity":stat_test,"trend":"upward" if fc["forecast"][-1]>series[-1] else "downward","change_pct":round((fc["forecast"][-1]-series[-1])/max(abs(series[-1]),0.001)*100,1)}
    return results

@router.get("/livability-chart")
def livability_chart():
    historical = [62,65,68,70,72,73,74,74,73,75,76,78]
    fc = _fit(historical, steps=3)
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan+1","Feb+1","Mar+1"]
    chart = []
    for i,m in enumerate(months):
        if i < 12:
            chart.append({"month":m,"actual":historical[i],"forecast":historical[i] if i==11 else None,"upper":None,"lower":None})
        else:
            fi = i-12
            chart.append({"month":m,"actual":None,"forecast":fc["forecast"][fi],"upper":fc["upper"][fi],"lower":fc["lower"][fi]})
    return {"data": chart}

@router.get("/correlation-matrix")
def correlation_matrix():
    from analytics.correlation import get_correlation_matrix
    return get_correlation_matrix()

@router.get("/top-correlations")
def top_correlations():
    return {"data": get_top_correlations(10)}

@router.get("/pairwise-stats")
def pairwise_stats():
    return {"data": get_pairwise_stats()}
