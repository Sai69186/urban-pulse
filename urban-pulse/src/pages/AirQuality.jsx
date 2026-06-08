import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import { airQualityData, aqiByNeighborhood, healthData, months } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";

const TOOLTIP = { background: "#1e293b", border: "1px solid #2d3f55", color: "#e2e8f0", borderRadius: 8, fontSize: 12 };

function AQIBadge({ aqi }) {
  const cat = aqi <= 50 ? ["Good","#10b981"] : aqi <= 100 ? ["Moderate","#f59e0b"]
    : aqi <= 150 ? ["USG","#f97316"] : aqi <= 200 ? ["Unhealthy","#ef4444"] : ["Hazardous","#8b5cf6"];
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: cat[1] + "22", color: cat[1], border: `1px solid ${cat[1]}44`,
    }}>{cat[0]}</span>
  );
}

const tableColumns = [
  { key: "month", label: "Month" },
  { key: "AQI",   label: "AQI",   render: (v) => <><span style={{ fontWeight: 700, color: v > 100 ? "#ef4444" : v > 50 ? "#f59e0b" : "#10b981" }}>{v}</span> <AQIBadge aqi={v} /></> },
  { key: "PM25",  label: "PM2.5 (μg/m³)", render: (v) => <span style={{ color: v > 25 ? "#f59e0b" : "#94a3b8" }}>{v}</span> },
  { key: "PM10",  label: "PM10 (μg/m³)",  render: (v) => <span style={{ color: v > 50 ? "#f59e0b" : "#94a3b8" }}>{v}</span> },
  { key: "NO2",   label: "NO₂ (μg/m³)",   render: (v) => <span style={{ color: v > 40 ? "#f97316" : "#94a3b8" }}>{v}</span> },
  { key: "O3",    label: "O₃ (μg/m³)",    render: (v) => <span>{v}</span> },
  { key: "CO",    label: "CO (mg/m³)",     render: (v) => <span>{v}</span> },
];

// AQI vs Hospital visits scatter
const scatterData = airQualityData.map((d, i) => ({ aqi: d.AQI, visits: healthData[i].hospitalVisits, month: d.month }));

export default function AirQuality() {
  const latest = airQualityData[airQualityData.length - 1];
  const prev   = airQualityData[airQualityData.length - 2];

  return (
    <div className="fade-in">
      {/* KPI */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard title="Current AQI" value={latest.AQI} unit=""
          change={+((latest.AQI - prev.AQI) / prev.AQI * 100).toFixed(1)}
          color={latest.AQI > 100 ? "#ef4444" : "#f59e0b"} icon="🌬️"
          sparkData={airQualityData.map(d => d.AQI)}
          subtitle="WHO safe limit: ≤50 (annual mean)" />
        <StatCard title="PM2.5" value={latest.PM25} unit="μg/m³"
          change={-2.8} color="#06b6d4" icon="🔬"
          sparkData={airQualityData.map(d => d.PM25)}
          subtitle="WHO guideline: ≤15 μg/m³" />
        <StatCard title="PM10" value={latest.PM10} unit="μg/m³"
          change={+1.4} color="#8b5cf6" icon="🫧"
          sparkData={airQualityData.map(d => d.PM10)}
          subtitle="WHO guideline: ≤45 μg/m³" />
        <StatCard title="NO₂" value={latest.NO2} unit="μg/m³"
          change={-3.1} color="#f59e0b" icon="⚗️"
          sparkData={airQualityData.map(d => d.NO2)}
          subtitle="WHO guideline: ≤10 μg/m³" />
        <StatCard title="O₃" value={latest.O3} unit="μg/m³"
          change={-4.2} color="#10b981" icon="☁️"
          sparkData={airQualityData.map(d => d.O3)}
          subtitle="Peak season pollutant" />
      </div>

      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        <SectionCard title="Monthly AQI Trend" subtitle="12-month profile with WHO safe threshold reference">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={airQualityData}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <ReferenceLine y={50}  stroke="#10b981" strokeDasharray="4 4" label={{ value: "Good (50)", fill: "#10b981", fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Moderate (100)", fill: "#f59e0b", fontSize: 10 }} />
              <Area type="monotone" dataKey="AQI" stroke="#ef4444" fill="url(#aqiGrad)" strokeWidth={2} name="AQI" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Pollutant Comparison" subtitle="PM2.5 vs PM10 seasonal pattern">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={airQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Bar dataKey="PM25" fill="#3b82f6" name="PM2.5" radius={[3,3,0,0]} />
              <Bar dataKey="PM10" fill="#8b5cf6" name="PM10"  radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <SectionCard title="Gaseous Pollutants — NO₂ & O₃" subtitle="Seasonal inversion pattern visible in winter months">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={airQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Line type="monotone" dataKey="NO2" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} name="NO₂ (μg/m³)" />
              <Line type="monotone" dataKey="O3"  stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4" }} name="O₃ (μg/m³)"  />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="AQI vs Hospital Visits" subtitle="Scatter analysis — air quality impact on public health">
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="aqi" name="AQI" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "AQI", position: "insideBottomRight", fill:"#475569", fontSize:11 }} />
              <YAxis dataKey="visits" name="Hospital Visits" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => payload?.[0] ? (
                  <div style={{ background: "#1e293b", padding: "8px 12px", borderRadius: 8, border: "1px solid #2d3f55", fontSize: 11 }}>
                    <div style={{ color: "#94a3b8" }}>{payload[0].payload.month}</div>
                    <div style={{ color: "#06b6d4" }}>AQI: {payload[0].payload.aqi}</div>
                    <div style={{ color: "#f97316" }}>Visits: {payload[0].payload.visits}</div>
                  </div>
                ) : null}
              />
              <Scatter data={scatterData} fill="#3b82f6" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: "#334155", marginTop: 8 }}>
            r = +0.72 — Strong positive correlation between AQI and hospital admissions
          </div>
        </SectionCard>
      </div>

      {/* Data Table */}
      <SectionCard title="Monthly Air Quality Data Table" subtitle="Full dataset with WHO threshold indicators">
        <DataTable columns={tableColumns} data={airQualityData} pageSize={12} />
      </SectionCard>
    </div>
  );
}
