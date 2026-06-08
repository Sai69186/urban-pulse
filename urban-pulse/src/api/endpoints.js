/**
 * All backend API endpoint functions
 * Each returns a Promise resolving to the parsed JSON response
 */

import api from "./client";

// ── Overview ────────────────────────────────────────────────────────────────
export const fetchOverview           = () => api.get("/api/overview");
export const fetchHealthCheck        = () => api.get("/api/health");

// ── Air Quality ──────────────────────────────────────────────────────────────
export const fetchAirQuality         = () => api.get("/api/air-quality/");
export const fetchAirQualityStats    = () => api.get("/api/air-quality/statistics");
export const fetchAirHealthCorr      = () => api.get("/api/air-quality/health-correlation");
export const fetchAirSeasonal        = () => api.get("/api/air-quality/seasonal");
export const fetchAirWorstMonths     = () => api.get("/api/air-quality/worst-months");
export const fetchAirHealthImpact    = () => api.get("/api/air-quality/health-impact-score");

// ── Crime ────────────────────────────────────────────────────────────────────
export const fetchCrime              = () => api.get("/api/crime/");
export const fetchCrimeSummary       = () => api.get("/api/crime/summary");
export const fetchCrimeBreakdown     = () => api.get("/api/crime/type-breakdown");
export const fetchCrimeStats         = () => api.get("/api/crime/statistics");
export const fetchCrimeSeasonal      = () => api.get("/api/crime/seasonal");
export const fetchCrimeNeighborhood  = () => api.get("/api/crime/neighborhood-risk");
export const fetchCrimeAnomalies     = () => api.get("/api/crime/anomaly-months");

// ── Economic ─────────────────────────────────────────────────────────────────
export const fetchEconomic           = () => api.get("/api/economic/");
export const fetchEconomicStats      = () => api.get("/api/economic/statistics");
export const fetchBusinessActivity   = () => api.get("/api/economic/business-activity");
export const fetchIncomeAffordCorr   = () => api.get("/api/economic/income-affordability-correlation");
export const fetchGdpTrend           = () => api.get("/api/economic/gdp-trend");
export const fetchEconomicScore      = () => api.get("/api/economic/health-score");

// ── Healthcare ───────────────────────────────────────────────────────────────
export const fetchHealthcare         = () => api.get("/api/healthcare/");
export const fetchHealthcareStats    = () => api.get("/api/healthcare/statistics");
export const fetchIcuAnalysis        = () => api.get("/api/healthcare/icu-analysis");
export const fetchRespiratoryAqi     = () => api.get("/api/healthcare/respiratory-aqi-correlation");
export const fetchResponseTime       = () => api.get("/api/healthcare/response-time-benchmark");
export const fetchPublicHealthScore  = () => api.get("/api/healthcare/public-health-score");

// ── Noise ────────────────────────────────────────────────────────────────────
export const fetchNoise              = () => api.get("/api/noise/");
export const fetchNoiseStats         = () => api.get("/api/noise/statistics");
export const fetchNoiseWho           = () => api.get("/api/noise/who-violations");
export const fetchNoiseSource        = () => api.get("/api/noise/source-breakdown");
export const fetchNoiseTrend         = () => api.get("/api/noise/complaint-trend");

// ── Neighborhoods ────────────────────────────────────────────────────────────
export const fetchNeighborhoods      = () => api.get("/api/neighborhoods/scores");
export const fetchNeighborhoodRank   = () => api.get("/api/neighborhoods/rankings");
export const fetchZoneSummary        = () => api.get("/api/neighborhoods/zones");
export const fetchGapAnalysis        = () => api.get("/api/neighborhoods/gap-analysis");
export const fetchImprovements       = () => api.get("/api/neighborhoods/improvement-priorities");

// ── Anomalies ────────────────────────────────────────────────────────────────
export const fetchAnomalies          = (severity) => api.get(`/api/anomalies/${severity ? `?severity=${severity}` : ""}`);
export const fetchAnomalySummary     = () => api.get("/api/anomalies/summary");
export const fetchStatAnomalies      = () => api.get("/api/anomalies/statistical");

// ── Sentiment ────────────────────────────────────────────────────────────────
export const fetchSentiment          = () => api.get("/api/sentiment/");
export const fetchSentimentTrend     = () => api.get("/api/sentiment/trend");
export const fetchSentimentReports   = () => api.get("/api/sentiment/reports");
export const fetchSentimentSummary   = () => api.get("/api/sentiment/summary");

// ── Forecast ─────────────────────────────────────────────────────────────────
export const fetchForecasts          = () => api.get("/api/forecast/");
export const fetchForecastChart      = () => api.get("/api/forecast/livability-chart");
export const fetchCorrMatrix         = () => api.get("/api/forecast/correlation-matrix");
export const fetchTopCorrelations    = () => api.get("/api/forecast/top-correlations");
export const fetchPairwiseStats      = () => api.get("/api/forecast/pairwise-stats");
