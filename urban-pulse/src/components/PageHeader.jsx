export default function PageHeader({ title, subtitle, icon, meta }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon && (
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "linear-gradient(135deg,#1e3a5f,#1e1b4b)",
              border: "1px solid #1e40af44",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>{icon}</div>
          )}
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{subtitle}</p>}
          </div>
        </div>
        {meta && <div style={{ display: "flex", gap: 10 }}>{meta}</div>}
      </div>
    </div>
  );
}
