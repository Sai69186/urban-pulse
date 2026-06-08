export default function SectionCard({ title, subtitle, children, action, style = {} }) {
  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1e293b",
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}>
      {(title || action) && (
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1a2537",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
