import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function DataTable({ columns, data, pageSize = 8 }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);

  const handleSort = (col) => {
    if (col.sortable === false) return;
    if (sortCol === col.key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col.key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const va = a[sortCol], vb = b[sortCol];
    const dir = sortDir === "asc" ? 1 : -1;
    if (typeof va === "number") return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col)} style={{ whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {col.sortable !== false && (
                      sortCol === col.key
                        ? sortDir === "asc"
                          ? <ChevronUp size={12} color="#3b82f6" />
                          : <ChevronDown size={12} color="#3b82f6" />
                        : <ChevronsUpDown size={12} color="#334155" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, padding: "0 4px" }}>
          <span style={{ fontSize: 11, color: "#475569" }}>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: 28, height: 28, borderRadius: 6,
                background: page === i ? "#1d4ed8" : "#1e293b",
                border: "none", color: page === i ? "#fff" : "#64748b",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
