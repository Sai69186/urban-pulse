import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import {
  fetchCrime, fetchCrimeSummary, fetchCrimeBreakdown,
  fetchCrimeSeasonal, fetchCrimeNeighborhood, fetchCrimeAnomalies,
} from "../api/endpoints";
import { crimeData as CR_FB, crimeByNeighborhood as CN_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP    = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const PIE_COLORS = ["#3b82f6","#ef4444","#f59e0b","#8b5cf6","#06b6d4"];

const neighborhoodColumns = [
  { key:"name",        label:"Neighborhood" },
  { key:"crimeRate",   label:"Crime Rate (per 10k)",
    render:(v) => <span style={{ color:v>40?"#ef4444":v>25?"#f59e0b":"#10b981", fontWeight:700 }}>{v}</span> },
  { key:"safetyScore", label:"Safety Score",
    render:(v) => (
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:5, background:"#1e293b", borderRadius:3 }}>
          <div style={{ width:`${v}%`, height:"100%", borderRadius:3, background:v>70?"#10b981":v>50?"#f59e0b":"#ef4444" }} />
        </div>
        <span style={{ fontSize:12, color:"#94a3b8", minWidth:26 }}>{v}</span>
      </div>
    ),
  },
  { key:"riskLevel",   label:"Risk Level",
    render:(v) => {
      const c = v==="Critical"?"#ef4444":v==="High"?"#f97316":v==="Medium"?"#f59e0b":"#10b981";
      return <span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:c+"22", color:c, border:`1px solid ${c}44` }}>{v||"Low"}</span>;
    },
  },
  { key:"hotspots",   label:"Hotspots",
    render:(v) => <span style={{ color:v>8?"#ef4444":v>4?"#f59e0b":"#94a3b8" }}>{v??"-"}</span> },
  { key:"resolved",   label:"Resolution Rate",
    render:(v) => v!=null ? <span style={{ color:v>75?"#10b981":"#94a3b8" }}>{v}%</span> : <span>-</span> },
];

export default function Crime() {
  const { results, errors, refresh } = useMultiApi({
    raw:      fetchCrime,
    summary:  fetchCrimeSummary,
    breakdown:fetchCrimeBreakdown,
    seasonal: fetchCrimeSeasonal,
    nbhd:     fetchCrimeNeighborhood,
    anomalies:fetchCrimeAnomalies,
  }, {
    raw:       { data: CR_FB },
    summary:   null,
    breakdown: null,
    seasonal:  null,
    nbhd:      CN_FB,
    anomalies: null,
  });

  useUploadRefresh(refresh);

  const data      = results.raw?.data    || CR_FB;
  const summary   = results.summary;
  const breakdown = results.breakdown    || [];
  const seasonal  = results.seasonal     || [];
  const nbhd      = Array.isArray(results.nbhd) ? results.nbhd : (results.nbhd?.data || CN_FB);
  const anomalyMonths = results.anomalies || [];
  const hasError  = Object.keys(errors).length > 0;

  // Derived totals (from backend summary or computed from raw data)
  const totalYTD    = summary?.total_ytd    ?? data.reduce((a,b) => a+(b.total||0), 0);
  const avgMonthly  = summary?.monthly_average ?? Math.round(totalYTD / Math.max(data.length,1));
  const peakMonth   = summary?.peak_month   ?? { month: data.reduce((a,b)=>b.total>a.total?b:a, data[0]||{})?.month, total:0 };
  const lowestMonth = summary?.lowest_month ?? { month: data.reduce((a,b)=>b.total<a.total?b:a, data[0]||{})?.month, total:0 };

  // Pie data from backend breakdown or computed
  const pieData = breakdown.length > 0
    ? breakdown.map(b => ({ name: b.type, value: b.total }))
    : ["theft","assault","vandalism","fraud","burglary"].map(t => ({
        name: t, value: data.reduce((a,b) => a+(b[t]||0), 0),
      }));

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      {/* KPI Row */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Total Crimes YTD"  value={totalYTD.toLocaleString()} unit="" change={summary?.yoy_change_pct ?? -4.2} color="#ef4444" icon="🚨" sparkData={data.map(d=>d.total||0)} subtitle="All categories combined" />
        <StatCard title="Monthly Average"   value={avgMonthly} unit="cases" change={-2.1} color="#f97316" icon="📊" sparkData={data.map(d=>d.total||0)} subtitle="Rolling 12-month average" />
        <StatCard title="Peak Month"        value={peakMonth.month||"—"} unit="" change={undefined} color="#f59e0b" icon="📈" subtitle={`${peakMonth.total} total incidents`} />
        <StatCard title="Lowest Month"      value={lowestMonth.month||"—"} unit="" change={undefined} color="#10b981" icon="📉" subtitle={`${lowestMonth.total} total incidents`} />
        <StatCard title="Theft Share"       value={pieData[0] ? ((pieData[0].value/Math.max(totalYTD,1))*100).toFixed(0) : 0} unit="%" change={-5.3} color="#3b82f6" icon="🔓" subtitle="Largest crime category" />
      </div>

      {/* Anomaly months alert */}
      {anomalyMonths.length > 0 && (
        <div style={{ background:"#1a0505", border:"1px solid #7f1d1d", borderRadius:10, padding:"12px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div>
            <div style={{ fontSize:13, color:"#fca5a5", fontWeight:700 }}>Statistical Crime Anomalies Detected</div>
            <div style={{ fontSize:11, color:"#7f1d1d" }}>
              {anomalyMonths.map(m => `${m.month} (z=${m.z_score}, +${Math.abs(m.deviation_pct||0)}% above threshold)`).join(" · ")}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Monthly Crime by Category" subtitle="Stacked view — seasonal pattern analysis">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="theft"     fill="#3b82f6" name="Theft"     stackId="a" />
              <Bar dataKey="assault"   fill="#ef4444" name="Assault"   stackId="a" />
              <Bar dataKey="vandalism" fill="#f59e0b" name="Vandalism" stackId="a" />
              <Bar dataKey="fraud"     fill="#8b5cf6" name="Fraud"     stackId="a" />
              <Bar dataKey="burglary"  fill="#06b6d4" name="Burglary"  stackId="a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Crime Type Distribution" subtitle="Annual proportional breakdown">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={82}
                dataKey="value" paddingAngle={3}
                label={({ percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {pieData.map((d,i) => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:9, height:9, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length] }} />
                  <span style={{ fontSize:11, color:"#94a3b8", textTransform:"capitalize" }}>{d.name}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Total Crime Trend" subtitle="Monthly volume with area fill">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fill="url(#crGrad)" strokeWidth={2} name="Total Crimes" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Theft vs Assault" subtitle="High-priority crime monthly comparison">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Line type="monotone" dataKey="theft"   stroke="#3b82f6" strokeWidth={2} dot={{ r:3 }} name="Theft" />
              <Line type="monotone" dataKey="assault" stroke="#ef4444" strokeWidth={2} dot={{ r:3 }} name="Assault" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Seasonal */}
      {seasonal.length > 0 && (
        <SectionCard title="Seasonal Crime Patterns" subtitle="Average crimes per season across all categories" style={{ marginBottom:18 }}>
          <div style={{ display:"flex", gap:14 }}>
            {seasonal.map(s => (
              <div key={s.season} style={{ flex:1, background:"#0d1117", border:"1px solid #1e293b", borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>{s.season}</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#ef4444" }}>{s.total?.toFixed(0)}</div>
                <div style={{ fontSize:10, color:"#475569" }}>avg total · theft: {s.theft?.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Neighborhood table */}
      <SectionCard title="Neighborhood Crime Profile" subtitle="Per-zone crime rate, safety score, risk level — sortable">
        <DataTable columns={neighborhoodColumns} data={nbhd} pageSize={8} />
      </SectionCard>
    </div>
  );
}
