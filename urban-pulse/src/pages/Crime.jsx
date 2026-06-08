import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { crimeData, crimeByNeighborhood } from "../data/cityData";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import DataTable from "../components/DataTable";

const TOOLTIP = { background: "#1e293b", border: "1px solid #2d3f55", color: "#e2e8f0", borderRadius: 8, fontSize: 12 };
const PIE_COLORS = ["#3b82f6","#ef4444","#f59e0b","#8b5cf6","#06b6d4"];

export default function Crime() {
  const totalYTD = crimeData.reduce((a, b) => a + b.total, 0);
  const avgMonthly = Math.round(totalYTD / crimeData.length);
  const peakMonth = crimeData.reduce((a, b) => b.total > a.total ? b : a);
  const lowestMonth = crimeData.reduce((a, b) => b.total < a.total ? b : a);

  const typeTotal = {
    Theft:     crimeData.reduce((a,b) => a+b.theft, 0),
    Assault:   crimeData.reduce((a,b) => a+b.assault, 0),
    Vandalism: crimeData.reduce((a,b) => a+b.vandalism, 0),
    Fraud:     crimeData.reduce((a,b) => a+b.fraud, 0),
    Burglary:  crimeData.reduce((a,b) => a+b.burglary, 0),
  };
  const pieData = Object.entries(typeTotal).map(([name,value]) => ({ name, value }));

  const tableColumns = [
    { key:"name", label:"Neighborhood" },
    { key:"crimeRate", label:"Crime Rate (per 10k)",
      render: (v) => <span style={{ color: v > 40 ? "#ef4444" : v > 25 ? "#f59e0b" : "#10b981", fontWeight:700 }}>{v}</span> },
    { key:"safetyScore", label:"Safety Score",
      render: (v) => (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, height:5, background:"#1e293b", borderRadius:3 }}>
            <div style={{ width:v+"%", height:"100%", borderRadius:3, background: v>70?"#10b981":v>50?"#f59e0b":"#ef4444" }} />
          </div>
          <span style={{ fontSize:12, color:"#94a3b8", minWidth:28 }}>{v}</span>
        </div>
      )
    },
    { key:"hotspots", label:"Hotspots",
      render: (v) => <span style={{ color: v > 8 ? "#ef4444" : v > 4 ? "#f59e0b" : "#94a3b8" }}>{v}</span> },
    { key:"resolved", label:"Resolution Rate",
      render: (v) => <span style={{ color: v > 75 ? "#10b981" : "#94a3b8" }}>{v}%</span> },
  ];

  return (
    <div className="fade-in">
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <StatCard title="Total Crimes YTD" value={totalYTD.toLocaleString()} unit=""
          change={-4.2} color="#ef4444" icon="🚨"
          sparkData={crimeData.map(d=>d.total)} subtitle="All crime categories combined" />
        <StatCard title="Monthly Average" value={avgMonthly} unit="cases"
          change={-2.1} color="#f97316" icon="📊"
          sparkData={crimeData.map(d=>d.total)} subtitle="Rolling 12-month average" />
        <StatCard title="Peak Month" value={peakMonth.month} unit=""
          change={undefined} color="#f59e0b" icon="📈"
          subtitle={`${peakMonth.total} total incidents`} />
        <StatCard title="Lowest Month" value={lowestMonth.month} unit=""
          change={undefined} color="#10b981" icon="📉"
          subtitle={`${lowestMonth.total} total incidents`} />
        <StatCard title="Theft Share" value={(typeTotal.Theft/totalYTD*100).toFixed(0)} unit="%"
          change={-5.3} color="#3b82f6" icon="🔓"
          subtitle="Largest crime category" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Monthly Crime Trend by Category" subtitle="Stacked view showing seasonal patterns">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={crimeData}>
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
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={88}
                dataKey="value" paddingAngle={3}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:2, background:PIE_COLORS[i] }} />
                  <span style={{ fontSize:12, color:"#94a3b8" }}>{d.name}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <SectionCard title="Total Crime Trend" subtitle="Monthly volume with rolling pattern">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={crimeData}>
              <defs>
                <linearGradient id="crimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2537" />
              <XAxis dataKey="month" tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:"#475569", fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fill="url(#crimeGrad)" strokeWidth={2} name="Total Crimes" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Theft vs Assault Trend" subtitle="High-priority crimes monthly comparison">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={crimeData}>
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

      <SectionCard title="Neighborhood Crime Profile" subtitle="Per-zone crime rate, safety score, hotspots, and resolution rate">
        <DataTable columns={tableColumns} data={crimeByNeighborhood} />
      </SectionCard>
    </div>
  );
}
