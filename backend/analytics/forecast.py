"""
Forecasting Module — ARIMA-based time series forecasting
- Fits ARIMA(1,1,1) on each metric
- Returns forecast + 95% confidence interval
- Computes trend direction, MAPE, and model summary
"""

import warnings
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
from data.seed_data import AIR_QUALITY, CRIME, ECONOMIC, HEALTH, NOISE

warnings.filterwarnings("ignore")

MONTHS_EXTENDED = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
    "Jan+1","Feb+1","Mar+1",
]


def _fit_arima(series: list, steps: int = 3) -> dict:
    """Fit ARIMA(1,1,1) and return forecast + confidence intervals."""
    arr = np.array(series, dtype=float)
    try:
        model  = ARIMA(arr, order=(1, 1, 1))
        result = model.fit()
        fc     = result.get_forecast(steps=steps)
        mean_fc  = fc.predicted_mean
        conf_int = fc.conf_int(alpha=0.05)

        # In-sample MAPE
        fitted = result.fittedvalues
        mape = float(np.mean(np.abs((arr[1:] - fitted[1:]) / arr[1:])) * 100)

        return {
            "success":    True,
            "forecast":   [round(float(v), 2) for v in mean_fc],
            "upper":      [round(float(v), 2) for v in conf_int[:, 1]],
            "lower":      [round(float(v), 2) for v in conf_int[:, 0]],
            "mape":       round(mape, 2),
            "aic":        round(float(result.aic), 2),
        }
    except Exception as e:
        # Fallback: linear extrapolation
        x = np.arange(len(arr))
        m, b = np.polyfit(x, arr, 1)
        fc = [round(float(m * (len(arr) + i) + b), 2) for i in range(steps)]
        return {
            "success":  False,
            "forecast": fc,
            "upper":    [round(v * 1.08, 2) for v in fc],
            "lower":    [round(v * 0.92, 2) for v in fc],
            "mape":     None,
            "aic":      None,
            "fallback_reason": str(e),
        }


def _stationarity_test(series: list) -> dict:
    result = adfuller(series)
    return {
        "adf_stat":   round(float(result[0]), 4),
        "p_value":    round(float(result[1]), 4),
        "is_stationary": bool(result[1] < 0.05),
    }


def get_all_forecasts() -> dict:
    df_aq = pd.DataFrame(AIR_QUALITY)
    df_cr = pd.DataFrame(CRIME)
    df_ec = pd.DataFrame(ECONOMIC)
    df_he = pd.DataFrame(HEALTH)
    df_no = pd.DataFrame(NOISE)

    metrics = {
        "livability_score": [62,65,68,70,72,73,74,74,73,75,76,78],
        "aqi":              df_aq["AQI"].tolist(),
        "crime_total":      df_cr["total"].tolist(),
        "unemployment":     df_ec["unemployment"].tolist(),
        "hospital_visits":  df_he["hospitalVisits"].tolist(),
        "noise_decibels":   df_no["avgDecibels"].tolist(),
    }

    results = {}
    for name, series in metrics.items():
        fc = _fit_arima(series, steps=3)
        results[name] = {
            **fc,
            "historical":    series,
            "stationarity":  _stationarity_test(series),
            "trend":         "upward" if fc["forecast"][-1] > series[-1] else "downward",
            "change_pct":    round((fc["forecast"][-1] - series[-1]) / series[-1] * 100, 1),
        }

    return results


def get_livability_forecast_chart() -> list:
    """Return full 12-month actual + 3-month forecast for chart rendering."""
    historical = [62,65,68,70,72,73,74,74,73,75,76,78]
    fc = _fit_arima(historical, steps=3)
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan+1","Feb+1","Mar+1"]
    chart = []
    for i, m in enumerate(months):
        if i < 12:
            chart.append({
                "month":   m,
                "actual":  historical[i],
                "forecast": historical[i] if i == 11 else None,  # overlap at boundary
                "upper":   None,
                "lower":   None,
            })
        else:
            fi = i - 12
            chart.append({
                "month":   m,
                "actual":  None,
                "forecast": fc["forecast"][fi],
                "upper":    fc["upper"][fi],
                "lower":    fc["lower"][fi],
            })
    return chart
