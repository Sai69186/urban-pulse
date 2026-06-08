import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { fetchAnomalies, fetchAnomalySummary, fetchStatAnomalies } from "../api/endpoints";
import { anomalies as AN_FB } from "../data/cityData";
import SectionCard from "../components/SectionCard";
import { ErrorBanner, LoadingSpinner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const SEV  = { critical:["#ef4444","#1a0505"], high:["#f97316","#1a0a00"], medium:["#f59e0b","#1a1200"], low:["#22c55e","#061209"] };
const SEVN = ["critical","high","medium","low"];

export default function Anomalies() {
  const [filter, setFilter] = useState("all");

  const { results, loading, errors } = useMultiApi({
    list:    fetchAnomalies,
    summary: fetchAnomalySummary,
    stats:   fetchStatAnomalies,
  }, { list:{ data: AN_FB }, summary:null, stats:null });

  const all     = results.list?.data    || AN_FB;
  const summary = results.summary;
  const statAn  = results.stats;
  const hasError = Object.keys(errors).length > 0;

  const filtered = filter === "all" ? all : all.filter(a => a.severity === filter);

  const byMetricData = summary?.by_metric
    ? Object.entries(summary.by_metric).map(([name, count]) => ({ name, count }))
    : [
        { name:"Air Quality",    count:2 },
        { name:"Crime Rate",     count:1 },
        { name:"Noise Level",    count:2 },
        { name:"Hospital Visits",count:1 },
        { name:"Unemployment",   count:1 },
        { name:"PM2.5",          count:1 },
      ];

  const counts = {
    critical: all.filter(a=>a.severity==="critical").length,
    high:     all.filter(a=>a.severity==="high").length,
    medium:   all.filter(a=>a.severity==="medium").length,
    low:      all.filter(a=>a.severity==="low").length,
  };

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      {/* Severity summary cards */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        {SEVN.map(sev => {
          const [color, bg] = SEV[sev];
          return (
            <div key={sev} onClick={()=>setFilter(filter===sev?"all":sev)}
              style={{
                flex:1, minWidth:140, background: filter===sev ? bg : "#0d1117",
                border:`1px solid ${filter===sev ? color+"66" : "#1e293b"}`,
                borderTop:`3px solid ${color}`,
                borderRadius:12, padding:"18px 20px", cursor:"pointer", transition:"all 0.15s",
              }}>
              <div style={{ fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>{sev}</div>
              <div style={{ fontSize:32, fontWeight:800, color }}>{counts[sev]}</div>
              <div style={{ fontSize:10, color:"#334155", marginTop:4 }}>alert{counts[sev]!==1?"s":""}</div>
            </div>
          );
        })}

        <SectionCard style={{ flex:2, minWidth:280, padding:0 }} title="Alerts by Metric">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={byMetricData} layout="vertical">
              <XAxis type="number" tick={{ fill:"#475569", fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill:"#64748b", fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="count" radius={[0,4,4,0]} barSize={10}>
                {byMetricData.map((_,i) => <Cell key={i} fill={["#3b82f6","#ef4444","#f59e0b","#8b5cf6","#06b6d4","#f97316"][i%6]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["all","critical","high","medium","low"].map(f => {
          const color = f==="all" ? "#3b82f6" : SEV[f]?.[0];
          return (
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:"7px 18px", borderRadius:7, border:"none", cursor:"pointer",
              fontSize:12, fontWeight:600, textTransform:"capitalize",
              background: filter===f ? color : "#111827",
              color:      filter===f ? "#fff" : "#64748b",
              transition:"all 0.15s",
            }}>{f} {f!=="all"?`(${counts[f]})`:""}</button>
          );
        })}
        <div style={{ marginLeft:"auto", fontSize:12, color:"#475569", display:"flex", alignItems:"center" }}>
          {filtered.length} alert{filtered.length!==1?"s":""} shown
        </div>
      </div>

      {/* Anomaly cards */}
      {loading ? <LoadingSpinner /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {filtered.map(a => {
            const [color, bg] = SEV[a.severity] || ["#94a3b8","#1e293b"];
            const dev = a.deviation_pct ?? (((a.value - a.threshold) / a.threshold) * 100).toFixed(1);
            return (
              <div key={a.id} style={{
                background: "#111827",
                border:`1px solid ${color}33`,
                borderLeft:`4px solid ${color}`,
                borderRadius:10, padding:"18px 22px",
                transition:"transform 0.15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ background:color+"22", color, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, textTransform:"uppercase", border:`1px solid ${color}44` }}>
                      {a.severity}
                    </span>
                    <span style={{ fontSize:15, fontWeight:700, color:"#e2e8f0" }}>{a.metric}</span>
                    <span style={{ fontSize:12, color:"#475569" }}>— {a.neighborhood}</span>
                  </div>
                  <span style={{ fontSize:11, color:"#334155", fontFamily:"monospace" }}>{a.date}</span>
                </div>

                <div style={{ display:"flex", gap:28, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>DETECTED VALUE</div>
                    <div style={{ fontSize:18, fontWeight:800, color }}>{a.value} <span style={{ fontSize:12, color:"#64748b" }}>{a.unit}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>THRESHOLD</div>
                    <div style={{ fontSize:18, fontWeight:700, color:"#64748b" }}>{a.threshold} <span style={{ fontSize:12 }}>{a.unit}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>DEVIATION</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#f59e0b" }}>+{dev}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:2 }}>SEVERITY SCORE</div>
                    <div style={{ fontSize:18, fontWeight:800, color }}>
                      {a.severity_score || { critical:4,high:3,medium:2,low:1 }[a.severity]}/4
                    </div>
                  </div>
                </div>

                <div style={{ background:"#0d1117", borderRadius:6, padding:"10px 14px", fontSize:12, color:"#94a3b8" }}>
                  📌 {a.description}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistical Anomalies from backend */}
      {statAn && (
        <SectionCard title="Statistical Anomaly Detection (Z-Score)" subtitle="Months where metric > mean + 1.5σ across all datasets">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {Object.entries(statAn).flatMap(([domain, metrics]) =>
              Object.entries(metrics).flatMap(([metric, rows]) =>
                rows.map((r, i) => (
                  <div key={`${domain}-${metric}-${i}`} style={{ background:"#0d1117", border:"1px solid #1e293b", borderRadius:8, padding:12 }}>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:4, textTransform:"uppercase" }}>{domain} › {r.metric || metric}</div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <span style={{ fontSize:13, fontWeight:700, color: r.direction==="spike"?"#ef4444":"#3b82f6" }}>{r.month}</span>
                        <span style={{ fontSize:11, color:"#64748b", marginLeft:6 }}>z={r.z_score}</span>
                      </div>
                      <span style={{ fontSize:11, color: r.direction==="spike"?"#ef4444":"#3b82f6" }}>
                        {r.direction==="spike"?"▲":"▼"} {Math.abs(r.deviation_pct)}%
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
