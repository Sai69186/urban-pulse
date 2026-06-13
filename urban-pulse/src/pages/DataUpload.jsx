import { useRef, useState, useCallback } from "react";
import {
  Upload, Trash2, Download, CheckCircle, AlertCircle,
  FileSpreadsheet, RefreshCw, Info, ChevronDown, ChevronUp,
} from "lucide-react";
import { useData, DATASET_TYPES } from "../context/DataContext";
import api from "../api/client";

const BASE = "http://localhost:8000";

const CATEGORY_META = {
  air_quality:   { icon: "💨", color: "#06b6d4", label: "Air Quality" },
  crime:         { icon: "🛡️", color: "#ef4444", label: "Crime" },
  economic:      { icon: "📈", color: "#f59e0b", label: "Economic" },
  health:        { icon: "🏥", color: "#10b981", label: "Healthcare" },
  noise:         { icon: "🔊", color: "#8b5cf6", label: "Noise" },
  neighborhoods: { icon: "📍", color: "#f97316", label: "Neighborhoods" },
  sentiment:     { icon: "💬", color: "#22c55e", label: "Sentiment" },
};

export default function DataUpload() {
  const { clearAll, uploadStatus, totalUploaded, refreshStatus } = useData();

  const [dragOver, setDragOver]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [result, setResult]         = useState(null);   // last upload result
  const [error, setError]           = useState(null);
  const [showSchema, setShowSchema] = useState(false);
  const inputRef = useRef(null);

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only CSV or Excel (.xlsx / .xls) files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File too large — maximum 20 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/api/upload/unified", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res);
      // Sync sidebar live-badges and per-page data indicators
      await refreshStatus();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || "Upload failed";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleReset = async () => {
    await clearAll();
    setResult(null);
    setError(null);
  };

  // Also clear result display if context says nothing is uploaded anymore
  const loadedKeys = result
    ? (totalUploaded > 0 ? result.categories_loaded : [])
    : Object.entries(uploadStatus).filter(([, v]) => v?.uploaded).map(([k]) => k);

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>
            Data Upload Center
          </h1>
          <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
            Upload <strong style={{ color: "#94a3b8" }}>one file</strong> containing all your urban area data — 
            the platform auto-detects and loads every category instantly.
          </p>
        </div>
        {totalUploaded > 0 && (
          <button onClick={handleReset} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#450a0a", border: "1px solid #7f1d1d",
            color: "#fca5a5", borderRadius: 8, padding: "8px 14px",
            fontSize: 12, cursor: "pointer", fontWeight: 600, flexShrink: 0,
          }}>
            <RefreshCw size={13} /> Reset All
          </button>
        )}
      </div>

      {/* ── How-it-works banner ─────────────────────────────────────────────── */}
      <div style={{
        background: "#0c1a2e", border: "1px solid #1e3a5f", borderRadius: 12,
        padding: "14px 18px", marginBottom: 24, display: "flex", gap: 12,
      }}>
        <Info size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.75 }}>
          <strong style={{ color: "#60a5fa" }}>Excel (.xlsx):</strong> create one sheet per category, 
          name each sheet after its category (e.g. <code style={{ color: "#93c5fd" }}>air_quality</code>, <code style={{ color: "#93c5fd" }}>crime</code>, <code style={{ color: "#93c5fd" }}>economic</code>…).{" "}
          <br />
          <strong style={{ color: "#60a5fa" }}>CSV:</strong> include a <code style={{ color: "#93c5fd" }}>sheet</code> column whose value is the category name,
          or use a wide table with all columns — the parser auto-detects each category's columns.{" "}
          <br />
          Download the ready-made template below to get started immediately.
        </div>
      </div>

      {/* ── Template download ───────────────────────────────────────────────── */}
      <div style={{
        background: "#111827", border: "1px solid #1e3a5f", borderRadius: 12,
        padding: "16px 20px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>
            📥 Multi-sheet Excel Template
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            All 7 categories pre-formatted with correct headers and 3 sample rows each.
            Just fill in your data and upload.
          </div>
        </div>
        <a
          href={`${BASE}/api/upload/template/unified/download`}
          download="urban_pulse_template.xlsx"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
            color: "#fff", borderRadius: 8, padding: "10px 18px",
            textDecoration: "none", fontSize: 13, fontWeight: 600,
            boxShadow: "0 0 16px rgba(59,130,246,0.25)", flexShrink: 0,
          }}>
          <Download size={14} /> Download Template
        </a>
      </div>

      {/* ── Drop Zone ───────────────────────────────────────────────────────── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#3b82f6" : result ? "#14532d" : "#2d3f55"}`,
          borderRadius: 16,
          background: dragOver ? "#0c1a2e" : result ? "#0a1f0a" : "#111827",
          padding: "44px 32px",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          transition: "all 0.2s",
          marginBottom: 24,
        }}>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ""; }}
        />

        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid #1e293b", borderTop: "3px solid #3b82f6",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 14, color: "#64748b" }}>Analysing and loading your data…</div>
          </div>
        ) : result ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <CheckCircle size={36} color="#22c55e" />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
              {result.total_categories} of 7 categories loaded
            </div>
            <div style={{ fontSize: 12, color: "#475569" }}>
              {result.filename} — click or drop a new file to re-upload
            </div>
          </div>
        ) : (
          <>
            <FileSpreadsheet size={40} color="#3b82f6" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
              <span style={{ color: "#60a5fa" }}>Click to upload</span> or drag & drop
            </div>
            <div style={{ fontSize: 12, color: "#475569" }}>
              One Excel (.xlsx) or CSV file containing all urban area categories
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 6 }}>
              Max 20 MB
            </div>
          </>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          marginBottom: 20, background: "#1a0505", border: "1px solid #7f1d1d",
          borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10,
        }}>
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.6 }}>{error}</div>
        </div>
      )}

      {/* ── Loaded categories result ─────────────────────────────────────────── */}
      {loadedKeys.length > 0 && (
        <div style={{
          background: "#0a1a0a", border: "1px solid #14532d", borderRadius: 14,
          padding: "18px 20px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={15} color="#22c55e" />
            Loaded Categories
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#14532d", fontWeight: 600 }}>
              {loadedKeys.length} / 7 active
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
            {DATASET_TYPES.map(({ key }) => {
              const meta = CATEGORY_META[key] || {};
              const isLoaded = loadedKeys.includes(key);
              const detail = result?.details?.[key] || uploadStatus[key];
              return (
                <div key={key} style={{
                  background: isLoaded ? "#052e16" : "#0d1117",
                  border: `1px solid ${isLoaded ? "#14532d" : "#1e293b"}`,
                  borderRadius: 10, padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                  opacity: isLoaded ? 1 : 0.45,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isLoaded ? "#4ade80" : "#475569" }}>
                      {meta.label}
                    </div>
                    {isLoaded && detail && (
                      <div style={{ fontSize: 10, color: "#14532d" }}>
                        {detail.rows} rows
                      </div>
                    )}
                  </div>
                  {isLoaded
                    ? <CheckCircle size={13} color="#22c55e" />
                    : <span style={{ fontSize: 10, color: "#334155" }}>not found</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Column schema reference (collapsible) ────────────────────────────── */}
      <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
        <button
          onClick={() => setShowSchema(s => !s)}
          style={{
            width: "100%", background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", color: "#e2e8f0",
          }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Column Reference & Accepted Formats</span>
          {showSchema ? <ChevronUp size={15} color="#475569" /> : <ChevronDown size={15} color="#475569" />}
        </button>

        {showSchema && (
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12, marginBottom: 16 }}>
              {DATASET_TYPES.map(({ key, label, required, optional }) => {
                const meta = CATEGORY_META[key] || {};
                return (
                  <div key={key} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                      <span>{meta.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{label}</span>
                      <span style={{ fontSize: 9, color: "#334155", marginLeft: "auto" }}>sheet: <code style={{ color: "#60a5fa" }}>{key}</code></span>
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>
                      <span style={{ color: "#ef4444" }}>Required: </span>
                      <span style={{ color: "#64748b" }}>{required.join(", ")}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#334155" }}>
                      <span style={{ color: "#475569" }}>Optional: </span>
                      {optional}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#0d1117", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#475569" }}>
              💡 <strong style={{ color: "#94a3b8" }}>Aliases auto-resolved:</strong>&nbsp;
              <code style={{ color: "#60a5fa" }}>pm2.5</code> → PM25 &nbsp;|&nbsp;
              <code style={{ color: "#60a5fa" }}>unemployment_rate</code> → unemployment &nbsp;|&nbsp;
              <code style={{ color: "#60a5fa" }}>hospital_visits</code> → hospitalVisits &nbsp;|&nbsp;
              <code style={{ color: "#60a5fa" }}>avg_decibels</code> → avgDecibels &nbsp;|&nbsp;
              column names are normalised automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
