import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Wind, ShieldAlert, TrendingUp,
  Heart, Volume2, MapPin, AlertTriangle, MessageSquare,
  BarChart3, Activity, UploadCloud,
} from "lucide-react";
import { useData } from "../context/DataContext";

const sections = [
  {
    label: "OVERVIEW",
    links: [
      { to:"/",       icon:LayoutDashboard, label:"Dashboard" },
      { to:"/upload", icon:UploadCloud,     label:"Data Upload", dynamic:true },
    ],
  },
  {
    label: "ENVIRONMENT",
    links: [
      { to:"/air-quality", icon:Wind,   label:"Air Quality",    dataKey:"air_quality" },
      { to:"/noise",       icon:Volume2,label:"Noise Pollution", dataKey:"noise" },
    ],
  },
  {
    label: "PUBLIC SAFETY",
    links: [
      { to:"/crime",     icon:ShieldAlert,  label:"Crime Analysis",  dataKey:"crime" },
      { to:"/anomalies", icon:AlertTriangle,label:"Anomaly Alerts",  badge:"3", badgeColor:"#ef4444" },
    ],
  },
  {
    label: "SOCIETY",
    links: [
      { to:"/economic",  icon:TrendingUp,   label:"Economic Health", dataKey:"economic" },
      { to:"/healthcare",icon:Heart,        label:"Healthcare",      dataKey:"health" },
      { to:"/sentiment", icon:MessageSquare,label:"Citizen Sentiment",dataKey:"sentiment" },
    ],
  },
  {
    label: "INTELLIGENCE",
    links: [
      { to:"/neighborhoods",icon:MapPin,   label:"Neighborhoods", dataKey:"neighborhoods" },
      { to:"/forecast",     icon:BarChart3,label:"Forecast",      badge:"ML",badgeColor:"#3b82f6" },
    ],
  },
];

export default function Sidebar() {
  const { isUploaded, totalUploaded } = useData();

  return (
    <aside style={{
      width:248, height:"100vh",
      background:"linear-gradient(180deg,#0d1117 0%,#070b14 100%)",
      borderRight:"1px solid #1e293b",
      display:"flex", flexDirection:"column",
      position:"fixed", top:0, left:0, zIndex:100,
      overflow:"hidden",
    }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid #1e293b" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(59,130,246,0.3)",flexShrink:0 }}>
            <Activity size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight:800,fontSize:15,color:"#f1f5f9",letterSpacing:"-0.3px" }}>Urban Pulse</div>
            <div style={{ fontSize:10,color:"#475569",fontWeight:500,letterSpacing:"0.5px" }}>CITY INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        {/* Live status */}
        <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:7, background:"#0f1f0f", border:"1px solid #14532d", borderRadius:6, padding:"5px 10px" }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e",display:"inline-block",flexShrink:0 }} />
          <span style={{ fontSize:10,color:"#86efac",fontWeight:600 }}>LIVE DATA STREAMS ACTIVE</span>
        </div>

        {/* Upload progress */}
        {totalUploaded > 0 && (
          <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:7, background:"#0c1a2e", border:"1px solid #1e3a5f", borderRadius:6, padding:"5px 10px" }}>
            <UploadCloud size={11} color="#60a5fa" />
            <span style={{ fontSize:10, color:"#60a5fa", fontWeight:600 }}>
              {totalUploaded}/7 DATASETS UPLOADED
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 10px", overflowY:"auto" }}>
        {sections.map((section) => (
          <div key={section.label} style={{ marginBottom:20 }}>
            <div style={{ fontSize:9,fontWeight:700,color:"#334155",letterSpacing:"1.2px",padding:"0 10px",marginBottom:4 }}>
              {section.label}
            </div>
            {section.links.map(({ to, icon:Icon, label, badge, badgeColor, dataKey, dynamic }) => {
              const uploaded = dataKey ? isUploaded(dataKey) : false;
              return (
                <NavLink key={to} to={to} end={to==="/"}
                  style={({ isActive }) => ({
                    display:"flex", alignItems:"center", gap:9,
                    padding:"9px 10px", borderRadius:8, marginBottom:1,
                    textDecoration:"none", fontSize:13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#f1f5f9" : "#64748b",
                    background: isActive ? "linear-gradient(90deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))" : "transparent",
                    borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                    transition:"all 0.15s",
                  })}>
                  <Icon size={15} />
                  <span style={{ flex:1 }}>{label}</span>

                  {/* Uploaded indicator dot */}
                  {uploaded && (
                    <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",flexShrink:0 }} title="Using your data" />
                  )}

                  {/* Dynamic upload badge */}
                  {dynamic && totalUploaded > 0 && (
                    <span style={{ fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44" }}>
                      {totalUploaded} LIVE
                    </span>
                  )}

                  {/* Static badge */}
                  {badge && !dynamic && (
                    <span style={{ fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:(badgeColor||"#3b82f6")+"22",color:badgeColor||"#60a5fa",border:`1px solid ${(badgeColor||"#3b82f6")}44` }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding:"14px 18px", borderTop:"1px solid #1e293b" }}>
        <div style={{ fontSize:10,color:"#1e293b",marginBottom:4,fontWeight:600,letterSpacing:"0.5px" }}>DATA ANALYST PORTFOLIO</div>
        <div style={{ fontSize:10,color:"#334155" }}>© 2024 Urban Pulse v3.0</div>
      </div>
    </aside>
  );
}
