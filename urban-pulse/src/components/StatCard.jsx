import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SparklineChart } from "./SparklineChart";

export default function StatCard({ title, value, unit, change, color = "#3b82f6", icon, sparkData, subtitle }) {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div style={{
      background: "linear-gradient(135deg, #111827 0%, #0d1421 100%)",
      border: "1px solid #1e293b",
      borderRadius: 14,
      padding: "20px",
      flex: 1,
      minWidth: 175,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: color + "0d", filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: color + "18", border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>{icon}</div>

        {change !== undefined && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 6,
            background: isNeutral ? "#1e293b" : isPositive ? "#052e16" : "#450a0a",
            border: `1px solid ${isNeutral ? "#334155" : isPositive ? "#14532d" : "#7f1d1d"}`,
            fontSize: 11, fontWeight: 600,
            color: isNeutral ? "#64748b" : isPositive ? "#4ade80" : "#f87171",
          }}>
            {isNeutral ? <Minus size={10} /> : isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isNeutral ? "0%" : `${isPositive ? "+" : ""}${change}%`}
          </div>
        )}
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
        {unit && <span style={{ fontSize: 13, fontWeight: 400, color: "#475569", marginLeft: 4 }}>{unit}</span>}
      </div>

      <div style={{ fontSize: 12, color: "#64748b", marginBottom: sparkData ? 10 : 0 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{subtitle}</div>}

      {sparkData && (
        <div style={{ marginTop: 8 }}>
          <SparklineChart data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}
