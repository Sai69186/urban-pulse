export function LoadingSpinner({ height = 300 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height, flexDirection:"column", gap:12 }}>
      <div style={{
        width:36, height:36, borderRadius:"50%",
        border:"3px solid #1e293b",
        borderTop:"3px solid #3b82f6",
        animation:"spin 0.8s linear infinite",
      }} />
      <span style={{ fontSize:12, color:"#475569" }}>Loading data...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background:"#1a0a0a", border:"1px solid #7f1d1d",
      borderRadius:10, padding:"12px 16px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      marginBottom:20,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:16 }}>⚠️</span>
        <div>
          <div style={{ fontSize:13, color:"#fca5a5", fontWeight:600 }}>Backend Unavailable</div>
          <div style={{ fontSize:11, color:"#7f1d1d" }}>{message} — Showing static fallback data</div>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          background:"#7f1d1d", border:"1px solid #991b1b",
          color:"#fca5a5", borderRadius:6,
          padding:"5px 12px", fontSize:12, cursor:"pointer",
        }}>Retry</button>
      )}
    </div>
  );
}

export function BackendStatus({ connected }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:6,
      padding:"4px 10px", borderRadius:6,
      background: connected ? "#0f1f0f" : "#1a0a0a",
      border:`1px solid ${connected ? "#14532d" : "#7f1d1d"}`,
      fontSize:11,
    }}>
      <span style={{
        width:6, height:6, borderRadius:"50%",
        background: connected ? "#22c55e" : "#ef4444",
        boxShadow:`0 0 6px ${connected ? "#22c55e" : "#ef4444"}`,
        display:"inline-block",
      }} />
      <span style={{ color: connected ? "#86efac" : "#fca5a5", fontWeight:600 }}>
        {connected ? "API CONNECTED" : "API OFFLINE"}
      </span>
    </div>
  );
}
