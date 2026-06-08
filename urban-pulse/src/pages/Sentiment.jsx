import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";
import { useMultiApi } from "../hooks/useApi";
import { fetchSentiment, fetchSentimentTrend, fetchSentimentReports, fetchSentimentSummary } from "../api/endpoints";
import { citizenSentiment as S_FB, sentimentTrend as ST_FB, citizenReports as CR_FB } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import { ErrorBanner } from "../components/LoadingState";

const TOOLTIP = { background:"#1e293b", border:"1px solid #2d3f55", color:"#e2e8f0", borderRadius:8, fontSize:12 };
const SENT_COLOR = { positive:"#10b981", neutral:"#f59e0b", negative:"#ef4444" };
const SENT_EMOJI = { positive:"😊", neutral:"😐", negative:"😞" };

export default function Sentiment() {
  const { results, errors } = useMultiApi({
    data:    fetchSentiment,
    trend:   fetchSentimentTrend,
    reports: fetchSentimentReports,
    summary: fetchSentimentSummary,
  }, { data:{ data:S_FB }, trend:{ data:ST_FB }, reports:{ data:CR_FB }, summary:null });

  const sentData  = results.data?.data    || S_FB;
  const trendData = results.trend?.data   || ST_FB;
  const reports   = results.reports?.data || CR_FB;
  const summary   = results.summary;
  const hasError  = Object.keys(errors).length > 0;

  const overallPie = [
    { name:"Positive", value: summary?.overall_positive || 52, fill:"#10b981" },
    { name:"Neutral",  value: summary?.overall_neutral  || 23, fill:"#f59e0b" },
    { name:"Negative", value: summary?.overall_negative || 25, fill:"#ef4444" },
  ];

  return (
    <div className="fade-in">
      {hasError && <ErrorBanner message={Object.values(errors)[0]} />}

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Avg Positive Sentiment" value={summary?.overall_positive || 52} unit="%"  change={3.1}  color="#10b981" icon="😊" sparkData={trendData.map(d=>d.positive)} subtitle="City-wide satisfaction" />
        <StatCard title="Avg Negative Sentiment" value={summary?.overall_negative || 25} unit="%"  change={-1.8} color="#ef4444" icon="😞" sparkData={trendData.map(d=>d.negative)} subtitle="Dissatisfaction index" />
        <StatCard title="Net Sentiment Score"     value={summary?.net_sentiment_score || 27} unit="" change={4.2}  color="#3b82f6" icon="📊" subtitle="Positive minus negative %" />
        <StatCard title="Total Responses"         value={summary?.total_responses?.toLocaleString() || "22,000+"} unit="" change={undefined} color="#8b5cf6" icon="📋" subtitle="NLP-analyzed citizen feedback" />
        {summary?.best_category && (
          <StatCard title="Top Rated Category" value={summary.best_category.name} unit="" change={undefined} color="#10b981" icon="🌟" subtitle={`${summary.best_category.positive}% positive`} />
        )}
        {summary?.worst_category && (
          <StatCard title="Most Complaints" value={summary.worst_category.name} unit="" change={undefined} color="#ef4444" icon="⚡" subtitle={`${summary.worst_category.negative}% negative`} />
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Sentiment by Category" subtitle="Stacked positive / neutral / negative breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" horizontal={false} />
              <XAxis type="number" domain={[0,100]} tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" width={120} tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v}%`} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="positive" fill="#10b981" name="Positive %" stackId="a" />
              <Bar dataKey="neutral"  fill="#f59e0b" name="Neutral %"  stackId="a" />
              <Bar dataKey="negative" fill="#ef4444" name="Negative %" stackId="a" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Overall City Sentiment" subtitle="Aggregate across all 8 categories">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={overallPie} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                dataKey="value" paddingAngle={3}
                label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                {overallPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
            {overallPie.map(d => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:d.fill }} />
                  <span style={{ fontSize:12, color:"#94a3b8" }}>{d.name}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:d.fill }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Sentiment Trend (12 Months)" subtitle="Monthly tracking of city-wide public satisfaction">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} formatter={(v)=>`${v}%`} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} name="Positive %" />
              <Line  type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} name="Negative %" />
              <Line  type="monotone" dataKey="neutral"  stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Neutral %" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Trend arrows */}
        <SectionCard title="Category Momentum" subtitle="Month-over-month sentiment direction">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {sentData.map(cat => {
              const isUp = cat.trend > 0;
              const isFlat = cat.trend === 0;
              return (
                <div key={cat.category} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#0d1117", borderRadius:8 }}>
                  <div style={{ flex:1, fontSize:13, color:"#94a3b8" }}>{cat.category}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:80, height:4, background:"#1e293b", borderRadius:2 }}>
                      <div style={{ width:`${cat.positive}%`, height:"100%", background:"#10b981", borderRadius:2 }} />
                    </div>
                    <span style={{ fontSize:11, color:"#10b981", minWidth:30 }}>{cat.positive}%</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color: isFlat?"#475569":isUp?"#10b981":"#ef4444", minWidth:36 }}>
                    {isFlat?"→":isUp?"↑":"↓"} {Math.abs(cat.trend)}%
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Citizen Reports */}
      <SectionCard title="Recent Citizen Reports" subtitle="NLP-classified public feedback — live sentiment stream">
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              display:"flex", alignItems:"flex-start", gap:14,
              padding:"12px 14px", background:"#0d1117", borderRadius:8,
              borderLeft:`3px solid ${SENT_COLOR[r.sentiment]}`,
            }}>
              <span style={{ fontSize:20 }}>{SENT_EMOJI[r.sentiment]}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:SENT_COLOR[r.sentiment], textTransform:"uppercase" }}>{r.sentiment}</span>
                  <span style={{ fontSize:11, color:"#3b82f6" }}>#{r.category}</span>
                </div>
                <div style={{ fontSize:13, color:"#cbd5e1" }}>{r.text}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <span style={{ fontSize:10, color:"#334155" }}>{r.time}</span>
                <span style={{ fontSize:10, color:"#475569" }}>👍 {r.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
