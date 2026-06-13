import { useState, useEffect } from "react";
import { Bell, Download, RefreshCw, Search, Calendar, UploadCloud } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

const PAGE_TITLES = {
  "/":              { title:"Dashboard Overview",    sub:"City-wide composite intelligence" },
  "/air-quality":   { title:"Air Quality Analysis",  sub:"Pollution monitoring & health impact" },
  "/crime":         { title:"Crime Analytics",        sub:"Pattern detection & safety index" },
  "/economic":      { title:"Economic Health",        sub:"Employment, income & business activity" },
  "/healthcare":    { title:"Healthcare Metrics",     sub:"Hospital capacity & public health" },
  "/noise":         { title:"Noise Pollution",        sub:"Decibel monitoring & complaint analysis" },
  "/neighborhoods": { title:"Neighborhood Analysis",  sub:"Composite livability scoring by zone" },
  "/anomalies":     { title:"Anomaly Detection",      sub:"Statistical outliers & threshold alerts" },
  "/sentiment":     { title:"Citizen Sentiment",      sub:"NLP-classified public feedback analysis" },
  "/forecast":      { title:"Forecast & Prediction",  sub:"ARIMA-based 90-day outlook" },
  "/upload":        { title:"Data Upload Center",     sub:"Upload your own CSV / Excel / JSON datasets" },
};

// which dataKey maps to each page
const PAGE_DATA_KEY = {
  "/air-quality":   "air_quality",
  "/crime":         "crime",
  "/economic":      "economic",
  "/healthcare":    "health",
  "/noise":         "noise",
  "/neighborhoods": "neighborhoods",
  "/sentiment":     "sentiment",
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES["/"];
  const { isUploaded, totalUploaded, refreshStatus } = useData();
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const pageDataKey = PAGE_DATA_KEY[location.pathname];
  const currentPageUploaded = pageDataKey ? isUploaded(pageDataKey) : false;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();   // re-sync upload state → triggers useUploadRefresh on all pages
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ page: page.title, exported: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `urban-pulse-${location.pathname.replace("/","") || "overview"}.json`;
    a.click();
  };

  return (
    <header style={{
      position:"fixed", top:0, left:248, right:0, height:62, zIndex:90,
      background:"rgba(7,11,20,0.94)", backdropFilter:"blur(12px)",
      borderBottom:"1px solid #1e293b",
      display:"flex", alignItems:"center", padding:"0 24px", gap:12,
    }}>
      {/* Page title */}
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>{page.title}</div>
          {/* Data source badge */}
          {currentPageUploaded ? (
            <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"#22c55e22", color:"#22c55e", border:"1px solid #22c55e44", letterSpacing:"0.5px" }}>
              ● YOUR DATA
            </span>
          ) : location.pathname !== "/upload" && (
            <span style={{ fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4, background:"#3b82f622", color:"#60a5fa", border:"1px solid #3b82f644", letterSpacing:"0.5px" }}>
              DEFAULT
            </span>
          )}
        </div>
        <div style={{ fontSize:11, color:"#475569" }}>{page.sub}</div>
      </div>

      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#111827", border:"1px solid #1e293b", borderRadius:8, padding:"6px 12px", width:180 }}>
        <Search size={12} color="#475569" />
        <input placeholder="Search metrics..." style={{ background:"none", border:"none", outline:"none", color:"#94a3b8", fontSize:12, width:"100%" }} />
      </div>

      {/* Date range */}
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"#111827", border:"1px solid #1e293b", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#64748b" }}>
        <Calendar size={12} />
        <span>Jan – Dec 2024</span>
      </div>

      {/* Upload shortcut badge */}
      {totalUploaded > 0 ? (
        <div onClick={() => navigate("/upload")}
          style={{ display:"flex", alignItems:"center", gap:6, background:"#0c1a2e", border:"1px solid #1e3a5f", borderRadius:8, padding:"5px 11px", cursor:"pointer", fontSize:11, color:"#60a5fa", fontWeight:600 }}>
          <UploadCloud size={13} />
          {totalUploaded} datasets active
        </div>
      ) : (
        <div onClick={() => navigate("/upload")}
          style={{ display:"flex", alignItems:"center", gap:6, background:"#111827", border:"1px solid #1e293b", borderRadius:8, padding:"5px 11px", cursor:"pointer", fontSize:11, color:"#475569" }}>
          <UploadCloud size={13} />
          Upload data
        </div>
      )}

      {/* Live clock */}
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#22c55e", fontWeight:500, background:"#0f1f0f", border:"1px solid #14532d", borderRadius:6, padding:"5px 10px" }}>
        {time.toLocaleTimeString()}
      </div>

      {/* Refresh */}
      <button onClick={handleRefresh} title="Refresh" style={iconBtn}>
        <RefreshCw size={14} color="#94a3b8"
          style={{ transition:"transform 0.6s", transform: refreshing ? "rotate(360deg)" : "none" }} />
      </button>

      {/* Export */}
      <button onClick={handleExport} title="Export" style={{ ...iconBtn, display:"flex", alignItems:"center", gap:6, padding:"6px 12px", fontSize:12, color:"#94a3b8" }}>
        <Download size={14} />Export
      </button>

      {/* Alerts */}
      <div style={{ position:"relative" }}>
        <button style={iconBtn} title="Alerts"><Bell size={14} color="#94a3b8" /></button>
        <span style={{ position:"absolute", top:4, right:4, width:7, height:7, borderRadius:"50%", background:"#ef4444", border:"1.5px solid #070b14" }} />
      </div>
    </header>
  );
}

const iconBtn = { background:"#111827", border:"1px solid #1e293b", borderRadius:8, padding:"6px 8px", cursor:"pointer", display:"flex", alignItems:"center", transition:"border-color 0.15s" };
