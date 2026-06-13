import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { useUploadRefresh } from "../hooks/useUploadRefresh";
import { fetchNeighborhoods, fetchZoneSummary, fetchGapAnalysis, fetchImprovements } from "../api/endpoints";
import { neighborhoodScores as NB_FB } from "../data/cityData";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const METRICS  = ["airQuality","safety","greenSpace","healthcare","economic","noise","transport"];
const M_LABELS = { airQuality:"Air Quality", safety:"Safety", greenSpace:"Green Space", healthcare:"Healthcare", economic:"Economic", noise:"Noise Score", transport:"Transport" };
const COLORS   = ["#3b82f6","#06b6d4","#10b981","#ef4444","#8b5cf6","#f59e0b","#f97316","#22c55e"];

function scoreColor(v) { return v >= 70 ? "#10b981" : v >= 50 ? "#f59e0b" : "#ef4444"; }
function gradeColor(g) { return g==="A"?"#10b981":g==="B"?"#3b82f6":g==="C"?"#f59e0b":"#ef4444"; }

export default function Neighborhoods() {
  const { results, errors, refresh } = useMultiApi({
    scores: fetchNeighborhoods,
    zones:  fetchZoneSummary,
    gaps:   fetchGapAnalysis,
    improv: fetchImprovements,
  }, { scores:NB_FB, zones:null, gaps:null, improv:null });

  const scores  = Array.isArray(results.scores) ? results.scores : (results.scores?.data || NB_FB);
  const zones   = results.zones;
  const gaps    = results.gaps;
  const improv  = results.improv;
  const hasError = Object.keys(errors).length > 0;
  useUploadRefresh(refresh);
  const [selected, setSelected] = useState(null);
  const active = selected || scores[0];

  const radarData = METRICS.map(m => ({ metric: M_LABELS[m], value: active?.[m] || 0 }));

  const tableColumns = [
    { key:"name",           label:"Neighborhood" },
    { key:"weightedScore",  label:"Livability Score",
      render:(v,row)=>{
        const score = v || row.livabilityScore;
        return <span style={{ color:scoreColor(score), fontWeight:700, fontSize:14 }}>{score}</span>;
      }
    },
    { key:"grade", label:"Grade",
      render:(v)=>v ? <span style={{ color:gradeColor(v), fontWeight:700, padding:"2px 8px", background:gradeColor(v)+"22", borderRadius:4 }}>{v}</span> : "—" },
    { key:"airQuality",  label:"Air", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
    { key:"safety",      label:"Safety", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
    { key:"greenSpace",  label:"Green", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
    { key:"healthcare",  label:"Health", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
    { key:"economic",    label:"Econ", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
    { key:"transport",   label:"Transit", render:(v)=><span style={{ color:scoreColor(v) }}>{v}</span> },
  ];

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:18, marginBottom:18 }}>
        {/* Neighborhood selector */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:520, overflowY:"auto" }}>
          {scores.map((n, i) => {
            const score = n.weightedScore || n.livabilityScore;
            const isActive = active?.id === n.id || active?.name === n.name;
            return (
              <div key={n.id || i} onClick={()=>setSelected(n)} style={{
                background: isActive ? "#0f1f3d" : "#0d1117",
                border:`1px solid ${isActive?"#3b82f6":"#1e293b"}`,
                borderLeft:`3px solid ${scoreColor(score)}`,
                borderRadius:10, padding:"12px 14px", cursor:"pointer",
                transition:"all 0.15s",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{n.name}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    {n.grade && <span style={{ fontSize:11, fontWeight:700, color:gradeColor(n.grade), background:gradeColor(n.grade)+"22", padding:"1px 6px", borderRadius:4 }}>{n.grade}</span>}
                    <span style={{ fontSize:17, fontWeight:800, color:scoreColor(score) }}>{score}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {METRICS.slice(0,4).map(m => (
                    <span key={m} style={{ fontSize:9, padding:"2px 5px", borderRadius:3, background:scoreColor(n[m])+"22", color:scoreColor(n[m]) }}>
                      {M_LABELS[m].split(" ")[0]}: {n[m]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Radar + bar */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <SectionCard title={`${active?.name || "—"} — Dimension Profile`} subtitle="7-axis livability radar">
            <ResponsiveContainer width="100%" height={270}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:"#64748b", fontSize:11 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.22} strokeWidth={2} />
                <Tooltip contentStyle={TOOLTIP} />
              </RadarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="All Neighborhoods — Score Comparison" subtitle="Side-by-side livability scores">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[...scores].sort((a,b)=>(b.weightedScore||b.livabilityScore)-(a.weightedScore||a.livabilityScore))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
                <XAxis dataKey="name" tick={{ fill:"#475569", fontSize:9 }} interval={0} angle={-15} textAnchor="end" height={44} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} />
                <Bar dataKey={scores[0]?.weightedScore ? "weightedScore" : "livabilityScore"} name="Livability Score" radius={[4,4,0,0]}>
                  {scores.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      </div>

      {/* Zone Summary */}
      {zones && (
        <SectionCard title="Zone-Level Summary" subtitle="Aggregated livability by city zone" style={{ marginBottom:18 }}>
          <div style={{ display:"flex", gap:14 }}>
            {zones.map(z => (
              <div key={z.zone} style={{ flex:1, background:"#0d1117", border:"1px solid #1e293b", borderRadius:10, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{z.zone}</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#3b82f6", marginBottom:4 }}>{z.avgLivability}</div>
                <div style={{ fontSize:11, color:"#64748b" }}>{z.neighborhoods} neighborhoods</div>
                <div style={{ fontSize:11, color:"#475569" }}>Pop: {z.totalPopulation?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Gap Analysis */}
      {gaps && (
        <SectionCard title="Metric Gap Analysis" subtitle="Best vs worst performing neighborhood per dimension" style={{ marginBottom:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {Object.entries(gaps).map(([metric, g]) => (
              <div key={metric} style={{ background:"#0d1117", border:"1px solid #1e293b", borderRadius:8, padding:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:8 }}>{M_LABELS[metric]}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:10, color:"#10b981" }}>Best: {g.best.score}</span>
                  <span style={{ fontSize:10, color:"#ef4444" }}>Worst: {g.worst.score}</span>
                </div>
                <div style={{ height:4, background:"#1e293b", borderRadius:2, marginBottom:4 }}>
                  <div style={{ width:`${g.best.score}%`, height:"100%", background:"#10b981", borderRadius:2 }} />
                </div>
                <div style={{ fontSize:9, color:"#334155" }}>Gap: {g.gap} pts</div>
                <div style={{ fontSize:9, color:"#10b981", marginTop:2 }}>{g.best.name}</div>
                <div style={{ fontSize:9, color:"#ef4444" }}>{g.worst.name}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Neighborhood Score Table" subtitle="Full composite scoring — all dimensions, sortable">
        <DataTable columns={tableColumns} data={scores} pageSize={8} />
      </SectionCard>
    </div>
  );
}
