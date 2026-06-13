import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import { fetchNoise, fetchNoiseStats, fetchNoiseWho, fetchNoiseSource, fetchNoiseTrend } from "../api/endpoints";
import { noiseData as N_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const WHO_DAY = 53, WHO_NIGHT = 45;

export default function Noise() {
  const { results, errors, refresh } = useMultiApi({
    raw:    fetchNoise,
    who:    fetchNoiseWho,
    source: fetchNoiseSource,
    trend:  fetchNoiseTrend,
  }, { raw:{ data:N_FB }, who:null, source:null, trend:null });

  const data   = results.raw?.data    || N_FB;
  const who    = results.who;
  const source = results.source;
  const trend  = results.trend;
  const latest = data[data.length - 1] || {};
  const hasError = Object.keys(errors).length > 0;
  useUploadRefresh(refresh);

  const dayViolations   = data.filter(d => d.avgDecibels    > WHO_DAY).length;
  const nightViolations = data.filter(d => d.nighttimeNoise > WHO_NIGHT).length;

  const tableColumns = [
    { key:"month",             label:"Month" },
    { key:"avgDecibels",       label:"Avg dB (Day)",
      render:(v)=><span style={{ color: v>WHO_DAY?"#ef4444":v>50?"#f59e0b":"#10b981", fontWeight:700 }}>{v} dB</span> },
    { key:"nighttimeNoise",    label:"Nighttime dB",
      render:(v)=><span style={{ color: v>WHO_NIGHT?"#ef4444":"#94a3b8" }}>{v} dB</span> },
    { key:"constructionNoise", label:"Construction dB", render:(v)=><span>{v}</span> },
    { key:"trafficNoise",      label:"Traffic dB",      render:(v)=><span>{v}</span> },
    { key:"complaints",        label:"Complaints",
      render:(v)=><span style={{ color: v>180?"#ef4444":v>130?"#f59e0b":"#94a3b8", fontWeight:700 }}>{v}</span> },
  ];

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Avg Noise Level"    value={latest.avgDecibels}    unit="dB"  change={1.2}  color={latest.avgDecibels>WHO_DAY?"#ef4444":"#f59e0b"} icon="📢" sparkData={data.map(d=>d.avgDecibels)}    subtitle={`WHO day limit: ${WHO_DAY} dB`} />
        <StatCard title="Nighttime Noise"    value={latest.nighttimeNoise} unit="dB"  change={-0.5} color={latest.nighttimeNoise>WHO_NIGHT?"#ef4444":"#8b5cf6"} icon="🌙" sparkData={data.map(d=>d.nighttimeNoise)} subtitle={`WHO night limit: ${WHO_NIGHT} dB`} />
        <StatCard title="Monthly Complaints" value={latest.complaints}     unit=""    change={-8.3} color="#f59e0b" icon="📋" sparkData={data.map(d=>d.complaints)} subtitle="Citizen noise complaints" />
        <StatCard title="Day WHO Violations" value={dayViolations}         unit="/12 mo" change={undefined} color="#ef4444" icon="🚨" subtitle={`Months above ${WHO_DAY} dB`} />
        <StatCard title="Night Violations"   value={nightViolations}       unit="/12 mo" change={undefined} color="#8b5cf6" icon="🌑" subtitle={`Months above ${WHO_NIGHT} dB`} />
      </div>

      {/* WHO Violation Alert */}
      {(dayViolations > 0 || nightViolations > 0) && (
        <div style={{ background:"#1a0d00", border:"1px solid #92400e", borderRadius:10, padding:"12px 18px", marginBottom:18, display:"flex", gap:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div>
              <div style={{ fontSize:12, color:"#fbbf24", fontWeight:700 }}>WHO Threshold Violations Detected</div>
              <div style={{ fontSize:11, color:"#92400e" }}>
                Daytime: {dayViolations} months above {WHO_DAY} dB • Nighttime: {nightViolations} months above {WHO_NIGHT} dB
              </div>
            </div>
          </div>
          {source && (
            <div style={{ marginLeft:"auto", fontSize:11, color:"#64748b", display:"flex", gap:16 }}>
              <span>🏗️ Avg construction: <strong style={{ color:"#94a3b8" }}>{source.avg_construction} dB</strong></span>
              <span>🚗 Avg traffic: <strong style={{ color:"#94a3b8" }}>{source.avg_traffic} dB</strong></span>
            </div>
          )}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Average Noise Level Trend" subtitle="Monthly dB with WHO day-limit reference line">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="noiseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[30,90]} tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v} dB`} />
              <ReferenceLine y={WHO_DAY}   stroke="#ef4444" strokeDasharray="4 4" label={{ value:`WHO Day (${WHO_DAY}dB)`,   fill:"#ef4444", fontSize:9 }} />
              <ReferenceLine y={WHO_NIGHT} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value:`WHO Night (${WHO_NIGHT}dB)`,fill:"#8b5cf6", fontSize:9 }} />
              <Area type="monotone" dataKey="avgDecibels" stroke="#f59e0b" fill="url(#noiseGrad)" strokeWidth={2} name="Avg dB" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Citizen Noise Complaints" subtitle={trend ? `Trend: ${trend.trend_direction} (R²=${trend.r_squared})` : "Monthly complaint volume"}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="complaints" name="Complaints" radius={[4,4,0,0]}>
                {data.map((d,i) => (
                  <rect key={i} fill={d.complaints > 180 ? "#ef4444" : d.complaints > 140 ? "#f59e0b" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Day vs Night Noise Comparison" subtitle="Identifying nighttime excess noise patterns">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v} dB`} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Line type="monotone" dataKey="avgDecibels"    stroke="#f59e0b" strokeWidth={2} dot={{ r:3 }} name="Daytime dB" />
              <Line type="monotone" dataKey="nighttimeNoise" stroke="#8b5cf6" strokeWidth={2} dot={{ r:3 }} name="Nighttime dB" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Noise Sources Breakdown" subtitle="Construction vs traffic — monthly average">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v} dB`} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="constructionNoise" fill="#f97316" name="Construction" radius={[3,3,0,0]} />
              <Bar dataKey="trafficNoise"      fill="#06b6d4" name="Traffic"      radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Full Noise Dataset" subtitle="Monthly decibel readings and complaint data">
        <DataTable columns={tableColumns} data={data} pageSize={12} />
      </SectionCard>
    </div>
  );
}
