import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import {
  fetchForecasts, fetchForecastChart,
  fetchTopCorrelations, fetchPairwiseStats,
} from "../api/endpoints";
import { forecastData as FC_FB } from "../data/cityData";
import SectionCard from "../components/SectionCard";
import { LoadingSpinner, ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };

const METRIC_META = {
  livability_score: { label:"City Livability Score", unit:"",   color:"#3b82f6", good:"up"   },
  aqi:              { label:"Average AQI",            unit:"",   color:"#06b6d4", good:"down" },
  crime_total:      { label:"Crime Total",            unit:"",   color:"#ef4444", good:"down" },
  unemployment:     { label:"Unemployment %",         unit:"%",  color:"#f59e0b", good:"down" },
  hospital_visits:  { label:"Hospital Visits",        unit:"",   color:"#f97316", good:"down" },
  noise_decibels:   { label:"Noise Level",            unit:"dB", color:"#8b5cf6", good:"down" },
};

export default function Forecast() {
  const { results, loading, errors, refresh } = useMultiApi({
    forecasts:    fetchForecasts,
    chart:        fetchForecastChart,
    topCorr:      fetchTopCorrelations,
    pairwise:     fetchPairwiseStats,
  }, { forecasts:null, chart:{ data: FC_FB }, topCorr:null, pairwise:null });

  const forecasts = results.forecasts;
  const chartData = results.chart?.data || FC_FB;
  const topCorr   = results.topCorr?.data;
  const pairwise  = results.pairwise?.data;
  const hasError  = Object.keys(errors).length > 0;
  useUploadRefresh(refresh);

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      {/* ARIMA Forecast Cards */}
      <SectionCard title="3-Month ARIMA Forecasts" subtitle="Fitted on 12-month historical data — 95% confidence intervals from backend" style={{ marginBottom:18 }}>
        {loading ? <LoadingSpinner height={180} /> : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(METRIC_META).map(([key, meta]) => {
              const fc = forecasts?.[key];
              const hist = fc?.historical || [];
              const current   = hist[hist.length - 1] ?? "—";
              const predicted = fc?.forecast?.[2] ?? "—";
              const change    = typeof current==="number" && typeof predicted==="number" ? predicted - current : null;
              const changePct = change !== null ? ((Math.abs(change)/Math.abs(current))*100).toFixed(1) : null;
              const isGood    = change !== null && (meta.good==="up" ? change>0 : change<0);
              const mape      = fc?.mape;
              const confidence = mape ? Math.max(60, Math.min(95, 100 - mape*2)).toFixed(0) : "—";

              return (
                <div key={key} style={{
                  background:"#0d1117", border:"1px solid #1e293b",
                  borderLeft:`3px solid ${meta.color}`,
                  borderRadius:10, padding:"14px 20px",
                  display:"flex", alignItems:"center", gap:20, flexWrap:"wrap",
                }}>
                  <div style={{ flex:"0 0 200px", fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{meta.label}</div>

                  <div style={{ flex:"0 0 90px" }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>CURRENT</div>
                    <div style={{ fontSize:17, fontWeight:700, color:"#94a3b8" }}>
                      {typeof current==="number"?current.toFixed(1):current}
                      <span style={{ fontSize:11, color:"#334155", marginLeft:3 }}>{meta.unit}</span>
                    </div>
                  </div>

                  <div style={{ color:"#334155", fontSize:20 }}>→</div>

                  <div style={{ flex:"0 0 90px" }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>FORECAST</div>
                    <div style={{ fontSize:17, fontWeight:800, color:meta.color }}>
                      {typeof predicted==="number"?predicted.toFixed(1):predicted}
                      <span style={{ fontSize:11, color:"#334155", marginLeft:3 }}>{meta.unit}</span>
                    </div>
                  </div>

                  <div style={{ flex:"0 0 100px" }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>CHANGE</div>
                    <div style={{ fontSize:13, fontWeight:700, color: change===null?"#475569":isGood?"#22c55e":"#ef4444" }}>
                      {change===null?"—":`${change>0?"+":""}${change.toFixed(1)} (${changePct}%)`}
                    </div>
                  </div>

                  <div style={{ flex:1, minWidth:150 }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>
                      MODEL CONFIDENCE {confidence !== "—" ? `${confidence}%` : ""} {mape?`· MAPE: ${mape}%`:""}
                    </div>
                    <div style={{ height:5, background:"#1e293b", borderRadius:3 }}>
                      <div style={{ width:`${confidence}%`, height:"100%", background:meta.color, borderRadius:3, transition:"width 1s ease" }} />
                    </div>
                  </div>

                  <div style={{
                    padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700,
                    background: change===null?"#1e293b":isGood?"#052e16":"#450a0a",
                    color: change===null?"#475569":isGood?"#4ade80":"#f87171",
                    border:`1px solid ${change===null?"#334155":isGood?"#14532d":"#7f1d1d"}`,
                  }}>
                    {change===null?"—":isGood?"IMPROVING":"WORSENING"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Livability Forecast Chart */}
      <SectionCard title="Livability Score — Actual vs ARIMA Forecast" subtitle="Shaded region = 95% confidence interval · Dashed = forecast · Vertical line = forecast boundary" style={{ marginBottom:18 }}>
        <ResponsiveContainer width="100%" height={310}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
            <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[55,95]} tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP}
              content={({ payload, label }) => payload?.length ? (
                <div style={{ background:"#1e293b", padding:"10px 14px", borderRadius:8, border:"1px solid #2d3f55", fontSize:11 }}>
                  <div style={{ color:"#64748b", marginBottom:6, fontWeight:600 }}>{label}</div>
                  {payload.map((p,i) => p.value != null && (
                    <div key={i} style={{ color:p.color||p.stroke, marginBottom:2 }}>
                      {p.name}: <strong>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            />
            <Legend wrapperStyle={{ fontSize:11 }} />
            <ReferenceLine x="Sep" stroke="#475569" strokeDasharray="5 3"
              label={{ value:"Forecast →", fill:"#64748b", fontSize:10, position:"insideTopRight" }} />
            <Area type="monotone" dataKey="upper" fill="#3b82f618" stroke="none" name="Upper CI" legendType="none" />
            <Area type="monotone" dataKey="lower" fill="#07111400" stroke="none" name="Lower CI" legendType="none" />
            <Line type="monotone" dataKey="actual"   stroke="#3b82f6" strokeWidth={2.5} dot={{ r:3, fill:"#3b82f6" }} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="7 3" dot={{ r:3, fill:"#8b5cf6" }} name="Forecast" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Top Correlations */}
      {topCorr && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
          <SectionCard title="Top Metric Correlations" subtitle="Strongest Pearson r relationships (backend computed)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCorr.slice(0,8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" horizontal={false} />
                <XAxis type="number" domain={[-1,1]} tick={{ fill:"#475569", fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="pair" type="category" width={160} tick={{ fill:"#94a3b8", fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} formatter={(v)=>v.toFixed(3)} />
                <Bar dataKey="r" name="Pearson r" radius={[0,4,4,0]} barSize={12}>
                  {topCorr.slice(0,8).map((d,i) => (
                    <Cell key={i} fill={d.r > 0 ? "#ef4444" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Key Pairwise Statistics" subtitle="Regression coefficients + significance tests">
            <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:260, overflowY:"auto" }}>
              {pairwise?.map((p, i) => (
                <div key={i} style={{ background:"#0d1117", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8" }}>{p.pair}</div>
                    <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>
                      slope={p.slope} · intercept={p.intercept}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, fontWeight:800, color: Math.abs(p.r)>0.6?"#ef4444":Math.abs(p.r)>0.3?"#f59e0b":"#94a3b8" }}>
                      r={p.r}
                    </div>
                    <div style={{
                      fontSize:9, padding:"2px 6px", borderRadius:4, marginTop:2,
                      background: p.significant?"#052e1688":"#1e293b",
                      color: p.significant?"#4ade80":"#475569",
                    }}>
                      {p.significant?"p<0.05 ✓":"not sig."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Model Info */}
      <SectionCard title="Forecasting Methodology" subtitle="Model architecture and validation approach used in backend">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { label:"Algorithm",         value:"ARIMA(1,1,1)",           icon:"🤖", color:"#3b82f6" },
            { label:"Training Window",   value:"12-month historical",     icon:"📚", color:"#8b5cf6" },
            { label:"Forecast Horizon",  value:"3 months ahead",          icon:"📅", color:"#06b6d4" },
            { label:"Confidence Interval","value":"95% (α=0.05)",         icon:"📐", color:"#10b981" },
            { label:"Validation",        value:"Walk-forward CV",         icon:"✅", color:"#f59e0b" },
            { label:"Fallback",          value:"Linear extrapolation",    icon:"📉", color:"#f97316" },
            { label:"Stationarity Test", value:"ADF (Augmented Dickey-Fuller)", icon:"📊", color:"#22c55e" },
            { label:"Metrics Used",      value:"6 city dimensions",       icon:"🏙️", color:"#a78bfa" },
            { label:"Library",           value:"statsmodels + scipy",     icon:"🐍", color:"#34d399" },
          ].map((item) => (
            <div key={item.label} style={{
              background:"#0d1117", border:"1px solid #1e293b",
              borderLeft:`3px solid ${item.color}`,
              borderRadius:10, padding:"14px 16px",
            }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:item.color, marginBottom:2 }}>{item.value}</div>
              <div style={{ fontSize:11, color:"#475569" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
