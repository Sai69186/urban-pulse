# 🏙️ Urban Pulse — City Health & Livability Intelligence Platform

> A full-stack data analyst portfolio project demonstrating end-to-end analytics, ML forecasting, anomaly detection, and real-time dashboards.

---

## 🚀 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18 + Vite, Recharts, React Router, Lucide |
| Backend   | Python FastAPI + Uvicorn                        |
| Analytics | Pandas, NumPy, SciPy, Statsmodels (ARIMA)       |
| ML        | Scikit-learn, ARIMA(1,1,1) time-series forecast |

---

## 📊 Features

- **10-page interactive dashboard** — Overview, Air Quality, Crime, Economic, Healthcare, Noise, Neighborhoods, Anomalies, Sentiment, Forecast
- **Real ARIMA forecasting** — 3-month ahead predictions with 95% confidence intervals (statsmodels backend)
- **Z-score anomaly detection** — statistical outlier detection across all city metrics
- **Pearson correlation matrix** — cross-domain metric interdependency analysis
- **40+ REST API endpoints** — FastAPI with auto-generated Swagger docs
- **Graceful fallback** — frontend works standalone with static data if backend is offline
- **Professional dark UI** — glassmorphism cards, sparklines, live clock, export button

---

## 📁 Project Structure

```
urban-pulse/          ← React + Vite frontend
  src/
    api/              ← Axios client + all endpoint functions
    components/       ← Sidebar, Topbar, StatCard, SectionCard, DataTable
    hooks/            ← useApi, useMultiApi data fetching hooks
    pages/            ← 10 dashboard pages
    data/             ← Static fallback data

backend/              ← Python FastAPI backend
  main.py             ← App entry point + CORS
  data/
    seed_data.py      ← Deterministic city dataset
  analytics/
    air_quality.py    ← WHO threshold analysis
    crime.py          ← Crime pattern detection
    economic.py       ← Business & income analytics
    healthcare.py     ← ICU, response time, vaccination
    anomaly_detection.py ← Z-score outlier detection
    forecast.py       ← ARIMA time-series forecasting
    correlation.py    ← Cross-domain Pearson correlation
    neighborhoods.py  ← Composite livability scoring
  routes/             ← FastAPI route handlers (one per domain)
```

---

## ⚡ Quick Start

### Backend
```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn scipy statsmodels
python -m uvicorn main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

### Frontend
```bash
cd urban-pulse
npm install
npm run dev
# App → http://localhost:5173
```

---

## 🔗 API Endpoints

| Endpoint                          | Description                        |
|-----------------------------------|------------------------------------|
| `GET /api/overview`               | City-wide KPI summary              |
| `GET /api/air-quality/statistics` | Pollutant stats + WHO violations   |
| `GET /api/crime/summary`          | YTD crime summary                  |
| `GET /api/anomalies/statistical`  | Z-score outlier detection results  |
| `GET /api/forecast/`              | ARIMA 3-month forecasts            |
| `GET /api/forecast/livability-chart` | Chart-ready forecast data       |
| `GET /api/forecast/top-correlations` | Top Pearson r pairs             |
| `GET /docs`                       | Full Swagger UI                    |

---

## 📈 Analytics Techniques Demonstrated

- Descriptive statistics (mean, std, IQR, percentiles)
- WHO threshold violation detection
- Pearson correlation & linear regression
- Z-score based anomaly detection
- ARIMA(1,1,1) time-series forecasting
- ADF stationarity testing
- Seasonal decomposition
- Composite index scoring (weighted normalization)
- Walk-forward cross-validation (MAPE)

---

*Built as a Data Analyst portfolio project — Urban Pulse v2.0*
