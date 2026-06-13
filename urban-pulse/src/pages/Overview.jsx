import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, ResponsiveContainer, Cell,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import {
  fetchOverview, fetchNeighborhoods,
  fetchAirQuality, fetchCrime,
} from "../api/endpoints";
import {
  neighborhoodScores as NBHD_FB,
  airQualityData as AQ_FB,
  crimeData as CR_FB,
  cityKPIs as KPI_FB,
} from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import { LoadingSpinner, ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background: "#1e293b", border: "1px solid #2d3f55", color: "#e2e8f0", borderRadius: 8, fontSize: 12 };
const BAR_COLORS = ["#3b82f6","#06b6d4","#10b981","#ef4444","#8b5cf6","#f59e0b","#f97316","#22c55e"];

const CORR_COLS = ["AQI","Crime","Unemployment","HospitalVisits","Noise","Livability"];
const STATIC_CORR = [
  { metric:"AQI",           AQI:1.00, Crime:-0.12, Unemployment:0.34,  HospitalVisits:0.72, Noise:0.48, Livability:-0.68 },
  { metric:"Crime",         AQI:-0.12,Crime:1.00,  Unemployment:0.58,  HospitalVisits:0.22, Noise:0.38, Livability:-0.74 },
  { metric:"Unemployment",  AQI:0.34, Crime:0.58,  Unemployment:1.00,  HospitalVisits:0.41, Noise:0.18, Livability:-0.62 },
  { metric:"HospitalVisits",AQI:0.72, Crime:0.22,  Unemployment:0.41,  HospitalVisits:1.00, Noise:0.29, Livability:-0.55 },
  { metric:"Noise",         AQI:0.48, Crime:0.38,  Unemployment:0.18,  HospitalVisits:0.29, Noise:1.00, Livability:-0.44 },
  { metric:"Livability",    AQI:-0.68,Crime:-0.74, Unemployment:-0.62, HospitalVisits:-0.55,Noise:-0.44,Livability:1.00  },
];

export default function Overview() {
  const { results, loading, errors, refresh } = useMultiApi({
    kpi:    fetchOverview,
    nbhd:   fetchNeighborhoods,
    aq:     fetchAirQuality,
    crime:  fetchCrime,
  }, {
    kpi:   KPI_FB,
    nbhd:  { data: NBHD_FB },
    aq:    { data: AQ_FB },
    crime: { data: CR_FB },
  });

  // Re-fetch whenever user uploads new data
  useUploadRefresh(refresh);

  const kpi    = results.kpi   || KPI_FB;
  const nbhd   = (results.nbhd?.data  || NBHD_FB);
  const aqData = (results.aq?.data    || AQ_FB);
  const crData = (results.crime?.data || CR_FB);
  const hasError = Object.keys(errors).length > 0;

  const radarData = [
    { metric:"Air Quality", value:72 }, { metric:"Safety",     value:68 },
    { metric:"Green Space", value:60 }, { metric:"Healthcare",  value:74 },
    { metric:"Economic",    value:70 }, { metric:"Noise",       value:63 },
    { metric:"Transport",   value:73 },
  ];

  const sorted = [...nbhd].sort((a,b) => (b.weightedScore||b.livabilityScore)-(a.weightedScore||a.livabilityScore));

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      {/* KPI Row */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Livability Score"   value={kpi.livabilityScore}   unit="/100" change={kpi.livabilityChange}   color="#3b82f6" icon="🏆" sparkData={[62,65,68,70,72,73,74,74,73,75,76,78]} subtitle="Composite city health index" />
        <StatCard title="City AQI"           value={kpi.avgAQI}            unit=""     change={kpi.aqiChange}          color="#06b6d4" icon="💨" sparkData={aqData.map(d=>d.AQI)}               subtitle="Annual average AQI" />
        <StatCard title="Crime Index"        value={kpi.crimeIndex}        unit=""     change={kpi.crimeChange}        color="#f97316" icon="🛡️" sparkData={crData.map(d=>d.total)}              subtitle="Incidents per 10k residents" />
        <StatCard title="Unemployment"       value={kpi.unemploymentRate}  unit="%"    change={kpi.unemploymentChange} color="#f59e0b" icon="💼" sparkData={[8.2,8.0,7.8,7.5,7.2,7.0,6.8,6.7,6.9,7.1,7.4,7.8]} subtitle="City-wide rate" />
        <StatCard title="Healthcare"         value={kpi.healthcareScore}   unit="/100" change={kpi.healthcareChange}   color="#10b981" icon="🏥" sparkData={[68,70,72,74,76,78,79,80,81,82,83,84]} subtitle="Vaccination & access index" />
        <StatCard title="Active Alerts"      value={kpi.activeAlerts||3}   unit=""     change={undefined}              color="#ef4444" icon="⚠️" subtitle="Open anomaly alerts" />
      </div>

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:18, marginBottom:18 }}>
        <SectionCard title="City Health Radar" subtitle="Multi-dimensional index averages">
          <ResponsiveContainer width="100%" height={270}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill:"#64748b", fontSize:11 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.18} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Neighborhood Livability Ranking" subtitle="Composite score 0–100 (higher = better)">
          {loading ? <LoadingSpinner height={270} /> : (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={sorted} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} />
                <Bar dataKey={sorted[0]?.weightedScore ? "weightedScore" : "livabilityScore"} radius={[0,6,6,0]} name="Score" barSize={16}>
                  {sorted.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="AQI vs Crime Trend Overlay" subtitle="Monthly correlation — pollution & public safety">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={aqData.map((a,i) => ({ month:a.month, AQI:a.AQI, Crime:crData[i]?.total }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:12, color:"#64748b" }} />
              <Line type="monotone" dataKey="AQI"   stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Crime" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Correlation Matrix */}
        <SectionCard title="Correlation Matrix" subtitle="Pearson r across city dimensions">
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <th style={{ fontSize:9, color:"#334155", padding:"4px 5px", textAlign:"left", border:"none" }}></th>
                  {CORR_COLS.map(k => (
                    <th key={k} style={{ fontSize:9, color:"#475569", padding:"4px 5px", textAlign:"center", fontWeight:600, border:"none" }}>
                      {k === "HospitalVisits" ? "Hosp." : k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STATIC_CORR.map((row) => (
                  <tr key={row.metric}>
                    <td style={{ fontSize:10, color:"#64748b", padding:"4px 5px", fontWeight:600, border:"none" }}>
                      {row.metric === "HospitalVisits" ? "Hosp." : row.metric}
                    </td>
                    {CORR_COLS.map(k => {
                      const v = row[k];
                      const bg = v === 1 ? "#1d4ed820"
                        : v > 0 ? `rgba(239,68,68,${Math.abs(v)*0.35})`
                        : `rgba(59,130,246,${Math.abs(v)*0.35})`;
                      const color = v === 1 ? "#3b82f6" : v > 0 ? "#fca5a5" : "#93c5fd";
                      return (
                        <td key={k} style={{ padding:"5px", textAlign:"center", fontSize:10, fontFamily:"monospace", fontWeight:700, background:bg, color, border:"none" }}>
                          {v.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:10, display:"flex", gap:14, fontSize:10, color:"#334155" }}>
            <span>🔴 Positive</span><span>🔵 Negative</span><span>1.00 = same</span>
          </div>
        </SectionCard>
      </div>

      {/* City KPI Grid */}
      <SectionCard title="City At a Glance" subtitle="Key performance indicators — all domains">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { label:"Total Population",      value:"254,000",  sub:"Metro area",              color:"#3b82f6", icon:"👥" },
            { label:"Green Space Ratio",      value:"18.4%",    sub:"+1.2% vs last year",      color:"#10b981", icon:"🌿" },
            { label:"Sentiment Score",        value:"55/100",   sub:"+3.1 pts month-on-month", color:"#8b5cf6", icon:"😊" },
            { label:"Data Sources Active",    value:"24",       sub:"IoT sensors + databases", color:"#f59e0b", icon:"📡" },
            { label:"Avg EMS Response",       value:"11.8 min", sub:"Target: <10 min",         color:"#ef4444", icon:"🚑" },
            { label:"Businesses Operating",   value:"8,420",    sub:"+34 net this month",      color:"#06b6d4", icon:"🏪" },
            { label:"Vaccination Coverage",   value:"80%",      sub:"City immunization rate",  color:"#22c55e", icon:"💉" },
            { label:"Anomalies Detected",     value:"8 YTD",    sub:"3 currently active",      color:"#f97316", icon:"🔍" },
          ].map((item) => (
            <div key={item.label} style={{ background:"#0d1117", border:"1px solid #1e293b", borderRadius:10, padding:"14px 16px", borderLeft:`3px solid ${item.color}` }}>
              <div style={{ fontSize:18, marginBottom:6 }}>{item.icon}</div>
              <div style={{ fontSize:16, fontWeight:800, color:item.color, marginBottom:2 }}>{item.value}</div>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:2 }}>{item.label}</div>
              <div style={{ fontSize:10, color:"#334155" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
