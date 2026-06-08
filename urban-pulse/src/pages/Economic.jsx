import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { fetchEconomic, fetchEconomicScore, fetchBusinessActivity, fetchGdpTrend, fetchEconomicStats } from "../api/endpoints";
import { economicData as ECO_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { LoadingSpinner, ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };

export default function Economic() {
  const { results, loading, errors } = useMultiApi({
    raw:      fetchEconomic,
    score:    fetchEconomicScore,
    business: fetchBusinessActivity,
    gdp:      fetchGdpTrend,
    stats:    fetchEconomicStats,
  }, {
    raw:      { data: ECO_FB },
    score:    null,
    business: null,
    gdp:      null,
    stats:    null,
  });

  const data     = results.raw?.data    || ECO_FB;
  const score    = results.score;
  const business = results.business     || data.map(d => ({ ...d, netActivity: d.businessOpenings - d.businessClosures }));
  const gdp      = results.gdp;
  const latest   = data[data.length - 1] || {};
  const hasError = Object.keys(errors).length > 0;

  const tableColumns = [
    { key:"month",               label:"Month" },
    { key:"unemployment",        label:"Unemployment %",
      render:(v)=><span style={{ color: v > 8 ? "#ef4444" : v > 7 ? "#f59e0b" : "#10b981", fontWeight:700 }}>{v}%</span> },
    { key:"medianIncome",        label:"Median Income",
      render:(v)=><span style={{ color:"#22c55e" }}>${v.toLocaleString()}</span> },
    { key:"businessOpenings",    label:"New Businesses", render:(v)=><span style={{ color:"#3b82f6" }}>{v}</span> },
    { key:"businessClosures",    label:"Closures",       render:(v)=><span style={{ color:"#ef4444" }}>{v}</span> },
    { key:"housingAffordability",label:"Affordability Index",
      render:(v)=>(<div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:5, background:"#1e293b", borderRadius:3 }}>
          <div style={{ width:v+"%", height:"100%", borderRadius:3, background: v>55?"#10b981":v>45?"#f59e0b":"#ef4444" }} />
        </div>
        <span style={{ fontSize:11, color:"#94a3b8", minWidth:24 }}>{v}</span>
      </div>)
    },
    { key:"gdpGrowth", label:"GDP Growth %",
      render:(v)=><span style={{ color: v >= 2.5 ? "#10b981" : "#f59e0b" }}>{v}%</span> },
  ];

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Unemployment Rate"     value={latest.unemployment} unit="%" change={-0.4} color="#f59e0b" icon="💼" sparkData={data.map(d=>d.unemployment)} subtitle="City-wide monthly rate" />
        <StatCard title="Median Income"         value={`$${((latest.medianIncome||55000)/1000).toFixed(1)}k`} unit="" change={1.2} color="#22c55e" icon="💰" sparkData={data.map(d=>d.medianIncome)} subtitle="Household median income" />
        <StatCard title="GDP Growth"            value={latest.gdpGrowth} unit="%" change={0.3} color="#3b82f6" icon="📈" sparkData={data.map(d=>d.gdpGrowth)} subtitle="Annual GDP growth rate" />
        <StatCard title="Housing Affordability" value={latest.housingAffordability} unit="/100" change={-2.1} color="#8b5cf6" icon="🏠" sparkData={data.map(d=>d.housingAffordability)} subtitle="Affordability index score" />
        {score && <StatCard title="Economic Health Score" value={score.composite_score} unit="/100" change={undefined} color={score.composite_score>65?"#10b981":"#f59e0b"} icon="🏦" subtitle={score.label} />}
      </div>

      {/* Score breakdown */}
      {score && (
        <SectionCard title="Economic Health Score Breakdown" subtitle="Weighted composite across 4 economic dimensions" style={{ marginBottom:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {[
              { label:"Unemployment Score", value:score.unemployment_score, color:"#f59e0b" },
              { label:"Income Score",       value:score.income_score,       color:"#22c55e" },
              { label:"Affordability",      value:score.affordability_score,color:"#8b5cf6" },
              { label:"GDP Score",          value:score.gdp_score,          color:"#3b82f6" },
            ].map(item => (
              <div key={item.label} style={{ background:"#0d1117", border:"1px solid #1e293b", borderRadius:10, padding:16, textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:800, color:item.color }}>{item.value}</div>
                <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{item.label}</div>
                <div style={{ marginTop:8, height:4, background:"#1e293b", borderRadius:2 }}>
                  <div style={{ width:`${item.value}%`, height:"100%", background:item.color, borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Unemployment Rate Trend" subtitle="Monthly rate — seasonal employment patterns visible">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="unempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v}%`} />
              <Area type="monotone" dataKey="unemployment" stroke="#f59e0b" fill="url(#unempGrad)" strokeWidth={2} name="Unemployment %" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Business Activity — Openings vs Closures" subtitle="Monthly new vs ceased businesses">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={Array.isArray(business) ? business : data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="businessOpenings" fill="#10b981" name="Openings" radius={[3,3,0,0]} />
              <Bar dataKey="businessClosures" fill="#ef4444" name="Closures" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Median Income vs Housing Affordability" subtitle="Dual-axis — income growth vs affordability index">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Line yAxisId="left"  type="monotone" dataKey="medianIncome"        stroke="#22c55e" strokeWidth={2} dot={false} name="Median Income ($)" />
              <Line yAxisId="right" type="monotone" dataKey="housingAffordability"stroke="#8b5cf6" strokeWidth={2} dot={false} name="Affordability Index" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="GDP Growth Rate" subtitle={gdp ? `Trend: ${gdp.trend_direction} | R²=${gdp.r_squared}` : "Monthly GDP growth %"}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gdpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v}%`} />
              <Area type="monotone" dataKey="gdpGrowth" stroke="#3b82f6" fill="url(#gdpGrad)" strokeWidth={2} name="GDP Growth %" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Full Economic Dataset" subtitle="Monthly economic indicators — sortable table">
        <DataTable columns={tableColumns} data={data} pageSize={12} />
      </SectionCard>
    </div>
  );
}
