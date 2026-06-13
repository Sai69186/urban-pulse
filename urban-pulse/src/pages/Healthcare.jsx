import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import { fetchHealthcare, fetchIcuAnalysis, fetchRespiratoryAqi, fetchResponseTime, fetchPublicHealthScore } from "../api/endpoints";
import { healthData as H_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };

export default function Healthcare() {
  const { results, loading, errors, refresh } = useMultiApi({
    raw:       fetchHealthcare,
    icu:       fetchIcuAnalysis,
    respAqi:   fetchRespiratoryAqi,
    response:  fetchResponseTime,
    score:     fetchPublicHealthScore,
  }, { raw:{ data:H_FB }, icu:null, respAqi:null, response:null, score:null });

  const data     = results.raw?.data    || H_FB;
  const icu      = results.icu;
  const respAqi  = results.respAqi;
  const response = results.response;
  const score    = results.score;
  const latest   = data[data.length - 1] || {};
  const hasError = Object.keys(errors).length > 0;
  useUploadRefresh(refresh);

  const tableColumns = [
    { key:"month",             label:"Month" },
    { key:"hospitalVisits",    label:"Hospital Visits",  render:(v)=><span style={{ color: v>700?"#ef4444":v>600?"#f59e0b":"#94a3b8", fontWeight:700 }}>{v}</span> },
    { key:"icuOccupancy",      label:"ICU Occupancy %",  render:(v)=><span style={{ color: v>80?"#ef4444":v>65?"#f59e0b":"#10b981", fontWeight:700 }}>{v}%</span> },
    { key:"respiratoryIssues", label:"Respiratory Cases",render:(v)=><span style={{ color: v>120?"#f97316":"#94a3b8" }}>{v}</span> },
    { key:"mentalHealthCases", label:"Mental Health",    render:(v)=><span>{v}</span> },
    { key:"avgResponseTime",   label:"Avg Response (min)",render:(v)=>(
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ color: v>12?"#ef4444":v>10?"#f59e0b":"#10b981", fontWeight:700 }}>{v}</span>
        <span style={{ fontSize:10, color:"#475569" }}>{v>10?"⚠️ Above target":""}</span>
      </div>)
    },
    { key:"vaccinationRate",   label:"Vaccination Rate", render:(v)=><span style={{ color:"#10b981" }}>{v}%</span> },
  ];

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Hospital Visits"  value={latest.hospitalVisits}  unit="/mo" change={-3.2} color="#3b82f6" icon="🏥" sparkData={data.map(d=>d.hospitalVisits)}   subtitle="Monthly admissions" />
        <StatCard title="ICU Occupancy"    value={latest.icuOccupancy}    unit="%"   change={2.1}  color="#ef4444" icon="🛏️" sparkData={data.map(d=>d.icuOccupancy)}     subtitle="Critical care capacity used" />
        <StatCard title="Avg Response"     value={latest.avgResponseTime} unit="min" change={-0.8} color={latest.avgResponseTime>10?"#f59e0b":"#10b981"} icon="🚑" sparkData={data.map(d=>d.avgResponseTime)} subtitle="EMS target: <10 min" />
        <StatCard title="Respiratory Cases"value={latest.respiratoryIssues}unit=""  change={2.1}  color="#f97316" icon="🫁" sparkData={data.map(d=>d.respiratoryIssues)} subtitle="AQI-correlated cases" />
        <StatCard title="Vaccination Rate" value={latest.vaccinationRate} unit="%"   change={1.4}  color="#22c55e" icon="💉" sparkData={data.map(d=>d.vaccinationRate)}   subtitle="City immunization coverage" />
        {score && <StatCard title="Public Health Score" value={score.composite_score} unit="/100" change={undefined} color={score.composite_score>65?"#10b981":"#f59e0b"} icon="❤️" subtitle={score.label} />}
      </div>

      {/* ICU Alert Banner */}
      {icu && icu.months_above_threshold?.length > 0 && (
        <div style={{ background:"#1a0500", border:"1px solid #7c2d12", borderRadius:10, padding:"12px 18px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🚨</span>
          <div>
            <div style={{ fontSize:13, color:"#fb923c", fontWeight:700 }}>ICU Capacity Alert</div>
            <div style={{ fontSize:11, color:"#7c2d12" }}>
              {icu.months_above_threshold.map(m => m.month).join(", ")} exceeded 80% threshold. Peak: {icu.max_occupancy}%
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Hospital Visits & ICU Occupancy" subtitle="Monthly admissions with ICU capacity pressure">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value:"ICU Critical (80%)", fill:"#ef4444", fontSize:9 }} />
              <Line yAxisId="left"  type="monotone" dataKey="hospitalVisits" stroke="#3b82f6" strokeWidth={2} dot={{ r:3 }} name="Hospital Visits" />
              <Line yAxisId="right" type="monotone" dataKey="icuOccupancy"   stroke="#ef4444" strokeWidth={2} dot={{ r:3 }} name="ICU Occupancy %" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Illness Type Breakdown" subtitle="Respiratory vs mental health monthly volume">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="respiratoryIssues" fill="#f97316" name="Respiratory" radius={[3,3,0,0]} />
              <Bar dataKey="mentalHealthCases" fill="#8b5cf6" name="Mental Health" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard
          title="Respiratory Cases vs AQI"
          subtitle={respAqi ? `r=${respAqi.correlation_r} — ${respAqi.interpretation}` : "AQI-health scatter analysis"}>
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="aqi"   name="AQI"    tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} label={{ value:"AQI", position:"insideBottomRight", fill:"#475569", fontSize:10 }} />
              <YAxis dataKey="cases" name="Cases"  tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP}
                content={({ payload }) => payload?.[0] ? (
                  <div style={{ background:"#1e293b", padding:"8px 12px", borderRadius:8, border:"1px solid #2d3f55", fontSize:11 }}>
                    <div style={{ color:"#94a3b8" }}>{payload[0].payload.month}</div>
                    <div style={{ color:"#06b6d4" }}>AQI: {payload[0].payload.aqi}</div>
                    <div style={{ color:"#f97316" }}>Cases: {payload[0].payload.cases}</div>
                  </div>
                ) : null}
              />
              <Scatter data={(respAqi?.scatter_data || data.map((d,i)=>({ aqi: i*10+50, cases: d.respiratoryIssues, month: d.month })))} fill="#f97316" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
          {respAqi && <div style={{ fontSize:10, color:"#334155", marginTop:6 }}>Pearson r = {respAqi.correlation_r} (p={respAqi.p_value}) — {respAqi.significant?"Statistically significant":"Not significant"}</div>}
        </SectionCard>

        <SectionCard
          title="EMS Response Time"
          subtitle={response ? `Compliance: ${response.compliance_rate}% | Target: <${response.target_minutes} min` : "Monthly response time vs target"}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v} min`} />
              <ReferenceLine y={10} stroke="#22c55e" strokeDasharray="4 4" label={{ value:"Target (10 min)", fill:"#22c55e", fontSize:9 }} />
              <Area type="monotone" dataKey="avgResponseTime" stroke="#ef4444" fill="url(#rtGrad)" strokeWidth={2} name="Avg Response (min)" />
            </AreaChart>
          </ResponsiveContainer>
          {response && (
            <div style={{ marginTop:10, display:"flex", gap:16, fontSize:11, color:"#64748b" }}>
              <span>✅ Best: <strong style={{ color:"#22c55e" }}>{response.best_month}</strong></span>
              <span>❌ Worst: <strong style={{ color:"#ef4444" }}>{response.worst_month}</strong></span>
              <span>Compliance: <strong style={{ color:"#3b82f6" }}>{response.compliance_rate}%</strong></span>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Full Healthcare Dataset" subtitle="Monthly indicators — ICU, response time & vaccination">
        <DataTable columns={tableColumns} data={data} pageSize={12} />
      </SectionCard>
    </div>
  );
}
