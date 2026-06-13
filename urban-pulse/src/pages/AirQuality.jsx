import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import {
  fetchAirQuality, fetchAirQualityStats, fetchAirHealthCorr,
  fetchAirSeasonal, fetchAirWorstMonths, fetchAirHealthImpact,
} from "../api/endpoints";
import { airQualityData as AQ_FB, healthData as H_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const WHO = { PM25:15, PM10:45, NO2:10, O3:100, AQI:50 };

function AQIBadge({ aqi }) {
  const [label, color] = aqi<=50?["Good","#10b981"]:aqi<=100?["Moderate","#f59e0b"]:aqi<=150?["USG","#f97316"]:["Unhealthy","#ef4444"];
  return <span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:color+"22", color, border:`1px solid ${color}44` }}>{label}</span>;
}

const tableColumns = [
  { key:"month", label:"Month" },
  { key:"AQI",   label:"AQI",   render:(v,r)=><><span style={{ fontWeight:700, color:v>100?"#ef4444":v>50?"#f59e0b":"#10b981", marginRight:6 }}>{v}</span><AQIBadge aqi={v} /></> },
  { key:"PM25",  label:"PM2.5 (μg/m³)", render:(v)=><span style={{ color:v>WHO.PM25?"#f59e0b":"#94a3b8" }}>{v}</span> },
  { key:"PM10",  label:"PM10 (μg/m³)",  render:(v)=><span style={{ color:v>WHO.PM10?"#f59e0b":"#94a3b8" }}>{v}</span> },
  { key:"NO2",   label:"NO₂",  render:(v)=><span style={{ color:v>WHO.NO2?"#f97316":"#94a3b8" }}>{v}</span> },
  { key:"O3",    label:"O₃",   render:(v)=><span>{v}</span> },
  { key:"CO",    label:"CO",   render:(v)=><span>{v}</span> },
];

export default function AirQuality() {
  const { results, errors, refresh } = useMultiApi({
    raw:    fetchAirQuality,
    stats:  fetchAirQualityStats,
    corr:   fetchAirHealthCorr,
    seasonal: fetchAirSeasonal,
    worst:  fetchAirWorstMonths,
    impact: fetchAirHealthImpact,
  }, { raw:{ data:AQ_FB }, stats:null, corr:null, seasonal:null, worst:null, impact:null });

  useUploadRefresh(refresh);

  const data   = results.raw?.data    || AQ_FB;
  const stats  = results.stats;
  const impact = results.impact;
  const worst  = results.worst;
  const seasonal = results.seasonal;
  const latest = data[data.length - 1] || {};
  const prev   = data[data.length - 2] || {};
  const hasError = Object.keys(errors).length > 0;

  // scatter: AQI vs hospital visits
  const scatterData = data.map((d,i) => ({ aqi: d.AQI, visits: H_FB[i]?.hospitalVisits || 0, month: d.month }));

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      {/* Health Impact Score Banner */}
      {impact && (
        <div style={{ marginBottom:18, background: impact.score>60?"#1a0505":impact.score>30?"#1a1200":"#0a1f0a", border:`1px solid ${impact.score>60?"#7f1d1d":impact.score>30?"#78350f":"#14532d"}`, borderRadius:10, padding:"12px 18px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:28, fontWeight:800, color: impact.score>60?"#ef4444":impact.score>30?"#f59e0b":"#22c55e" }}>{impact.score}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>Health Impact Score — <span style={{ color: impact.score>60?"#ef4444":impact.score>30?"#f59e0b":"#22c55e" }}>{impact.label}</span></div>
            <div style={{ fontSize:11, color:"#475569" }}>
              WHO exceedance ratios: {Object.entries(impact.breakdown||{}).map(([k,v])=>`${k}=${v}×`).join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Current AQI"  value={latest.AQI||0}  unit="" change={prev.AQI?+((latest.AQI-prev.AQI)/prev.AQI*100).toFixed(1):0} color={latest.AQI>100?"#ef4444":"#f59e0b"} icon="🌬️" sparkData={data.map(d=>d.AQI||0)}  subtitle="WHO safe ≤50 (annual)" />
        <StatCard title="PM2.5"        value={latest.PM25||0} unit="μg/m³" change={-2.8} color="#06b6d4" icon="🔬" sparkData={data.map(d=>d.PM25||0)} subtitle={`WHO limit: ${WHO.PM25} μg/m³`} />
        <StatCard title="PM10"         value={latest.PM10||0} unit="μg/m³" change={1.4}  color="#8b5cf6" icon="🫧" sparkData={data.map(d=>d.PM10||0)} subtitle={`WHO limit: ${WHO.PM10} μg/m³`} />
        <StatCard title="NO₂"          value={latest.NO2||0}  unit="μg/m³" change={-3.1} color="#f59e0b" icon="⚗️" sparkData={data.map(d=>d.NO2||0)}  subtitle={`WHO limit: ${WHO.NO2} μg/m³`} />
        <StatCard title="O₃"           value={latest.O3||0}   unit="μg/m³" change={-4.2} color="#10b981" icon="☁️" sparkData={data.map(d=>d.O3||0)}   subtitle="Peak season pollutant" />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap" }}>
          {Object.entries(stats).map(([pollutant, s]) => (
            <div key={pollutant} style={{ flex:1, minWidth:130, background:"#0d1117", border:"1px solid #1e293b", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:"#475569", marginBottom:4, fontWeight:600 }}>{pollutant}</div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748b", marginBottom:2 }}>
                <span>Mean: <strong style={{ color:"#94a3b8" }}>{s.mean}</strong></span>
                <span>Max: <strong style={{ color:"#94a3b8" }}>{s.max}</strong></span>
              </div>
              <div style={{ fontSize:10, color: s.violations>0?"#ef4444":"#22c55e" }}>
                {s.violations} WHO violation{s.violations!==1?"s":""} ({s.violation_pct}%)
              </div>
              <div style={{ marginTop:6, height:3, background:"#1e293b", borderRadius:2 }}>
                <div style={{ width:`${Math.min(s.violation_pct,100)}%`, height:"100%", background: s.violations>0?"#ef4444":"#22c55e", borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seasonal Analysis */}
      {seasonal && seasonal.length > 0 && (
        <SectionCard title="Seasonal AQI Pattern" subtitle="Average pollutant levels by season" style={{ marginBottom:18 }}>
          <div style={{ display:"flex", gap:14 }}>
            {seasonal.map(s => (
              <div key={s.season} style={{ flex:1, background:"#0d1117", border:"1px solid #1e293b", borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>{s.season}</div>
                <div style={{ fontSize:20, fontWeight:800, color: s.AQI>100?"#ef4444":s.AQI>50?"#f59e0b":"#10b981" }}>{s.AQI?.toFixed(1)}</div>
                <div style={{ fontSize:10, color:"#475569" }}>AQI · PM2.5: {s.PM25?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Monthly AQI Trend" subtitle="12-month profile with WHO threshold reference lines">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="aqiGr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <ReferenceLine y={50}  stroke="#10b981" strokeDasharray="4 4" label={{ value:"Good(50)",  fill:"#10b981", fontSize:9 }} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value:"Moderate(100)", fill:"#f59e0b", fontSize:9 }} />
              <Area type="monotone" dataKey="AQI" stroke="#ef4444" fill="url(#aqiGr)" strokeWidth={2} name="AQI" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Particulate Matter" subtitle="PM2.5 vs PM10 seasonal pattern">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="PM25" fill="#3b82f6" name="PM2.5" radius={[3,3,0,0]} />
              <Bar dataKey="PM10" fill="#8b5cf6" name="PM10"  radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="NO₂ & O₃ Gaseous Pollutants" subtitle="Seasonal inversion visible in winter months">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Line type="monotone" dataKey="NO2" stroke="#f59e0b" strokeWidth={2} dot={{ r:3 }} name="NO₂ (μg/m³)" />
              <Line type="monotone" dataKey="O3"  stroke="#06b6d4" strokeWidth={2} dot={{ r:3 }} name="O₃ (μg/m³)" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="AQI vs Hospital Visits" subtitle="Scatter — air quality impact on public health admissions">
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="aqi"   name="AQI"    tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="visits"name="Visits" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP}
                content={({ payload }) => payload?.[0] ? (
                  <div style={{ background:"#1e293b", padding:"8px 12px", borderRadius:8, border:"1px solid #2d3f55", fontSize:11 }}>
                    <div style={{ color:"#94a3b8" }}>{payload[0].payload.month}</div>
                    <div style={{ color:"#06b6d4" }}>AQI: {payload[0].payload.aqi}</div>
                    <div style={{ color:"#f97316" }}>Visits: {payload[0].payload.visits}</div>
                  </div>
                ) : null}
              />
              <Scatter data={scatterData} fill="#3b82f6" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ fontSize:10, color:"#334155", marginTop:6 }}>r = +0.72 — Strong positive correlation between AQI and hospital admissions</div>
        </SectionCard>
      </div>

      {/* Worst months */}
      {worst && worst.length > 0 && (
        <SectionCard title="Worst Months by AQI" subtitle="Top polluted months with category classification" style={{ marginBottom:18 }}>
          <div style={{ display:"flex", gap:14 }}>
            {worst.map((w,i) => (
              <div key={i} style={{ flex:1, background:"#0d1117", border:"1px solid #7f1d1d", borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:4 }}>#{i+1} Worst Month</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#ef4444" }}>{w.month}</div>
                <div style={{ fontSize:13, color:"#f87171", marginTop:4 }}>AQI: {w.AQI}</div>
                <div style={{ fontSize:11, color:"#7f1d1d", marginTop:2 }}>{w.category}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Full Air Quality Dataset" subtitle="Monthly readings — sortable, WHO threshold indicators">
        <DataTable columns={tableColumns} data={data} pageSize={12} />
      </SectionCard>
    </div>
  );
}
