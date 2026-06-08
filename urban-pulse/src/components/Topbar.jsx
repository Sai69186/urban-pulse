import { useState, useEffect } from "react";
import { Bell, Download, RefreshCw, Search, Calendar } from "lucide-react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES = {
  "/":              { title: "Dashboard Overview",   sub: "City-wide composite intelligence" },
  "/air-quality":   { title: "Air Quality Analysis", sub: "Pollution monitoring & health impact" },
  "/crime":         { title: "Crime Analytics",      sub: "Pattern detection & safety index" },
  "/economic":      { title: "Economic Health",      sub: "Employment, income & business activity" },
  "/healthcare":    { title: "Healthcare Metrics",   sub: "Hospital capacity & public health" },
  "/noise":         { title: "Noise Pollution",      sub: "Decibel monitoring & complaint analysis" },
  "/neighborhoods": { title: "Neighborhood Analysis",sub: "Composite livability scoring by zone" },
  "/anomalies":     { title: "Anomaly Detection",    sub: "Statistical outliers & threshold alerts" },
  "/sentiment":     { title: "Citizen Sentiment",    sub: "NLP-classified public feedback analysis" },
  "/forecast":      { title: "Forecast & Prediction",sub: "ML-driven 90-day outlook for city metrics" },
};

export default function Topbar() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES["/"];
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleExport = () => {
    const data = { page: page.title, exported: new Date().toISOString(), note: "Urban Pulse Data Export" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `urban-pulse-${location.pathname.replace("/","") || "overview"}.json`;
    a.click();
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 248, right: 0,
      height: 62, zIndex: 90,
      background: "rgba(7,11,20,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1e293b",
      display: "flex", alignItems: "center",
      padding: "0 28px", gap: 16,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>{page.title}</div>
        <div style={{ fontSize: 11, color: "#475569" }}>{page.sub}</div>
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#111827", border: "1px solid #1e293b",
        borderRadius: 8, padding: "6px 12px", width: 200,
      }}>
        <Search size={13} color="#475569" />
        <input
          placeholder="Search metrics..."
          style={{
            background: "none", border: "none", outline: "none",
            color: "#94a3b8", fontSize: 12, width: "100%",
          }}
        />
      </div>

      {/* Date range indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "#111827", border: "1px solid #1e293b",
        borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#64748b",
      }}>
        <Calendar size={13} />
        <span>Jan – Dec 2024</span>
      </div>

      {/* Live clock */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, color: "#22c55e", fontWeight: 500,
        background: "#0f1f0f", border: "1px solid #14532d",
        borderRadius: 6, padding: "5px 10px",
      }}>
        {time.toLocaleTimeString()}
      </div>

      {/* Actions */}
      <button onClick={handleRefresh} title="Refresh data" style={iconBtn}>
        <RefreshCw size={14} color="#94a3b8" style={{ transition: "transform 0.5s", transform: refreshing ? "rotate(360deg)" : "none" }} />
      </button>

      <button onClick={handleExport} title="Export data" style={{ ...iconBtn, display:"flex", alignItems:"center", gap:6, padding:"6px 12px", fontSize:12, color:"#94a3b8" }}>
        <Download size={14} />
        <span>Export</span>
      </button>

      <div style={{ position: "relative" }}>
        <button style={iconBtn} title="Alerts">
          <Bell size={14} color="#94a3b8" />
        </button>
        <span style={{
          position: "absolute", top: 4, right: 4,
          width: 7, height: 7, borderRadius: "50%",
          background: "#ef4444", border: "1.5px solid #070b14",
        }} />
      </div>
    </header>
  );
}

const iconBtn = {
  background: "#111827", border: "1px solid #1e293b",
  borderRadius: 8, padding: "6px 8px",
  cursor: "pointer", display: "flex", alignItems: "center",
  transition: "border-color 0.15s",
};
