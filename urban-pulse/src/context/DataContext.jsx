/**
 * Global context — tracks which datasets the user has uploaded.
 * All pages read this to show "LIVE" badge and refresh their data.
 */

import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const DataContext = createContext(null);

export const DATASET_TYPES = [
  { key:"air_quality",   label:"Air Quality",    icon:"💨", color:"#06b6d4", required:["AQI"],         optional:"PM25, PM10, NO2, O3, CO" },
  { key:"crime",         label:"Crime",          icon:"🛡️", color:"#ef4444", required:["total"],       optional:"theft, assault, vandalism, fraud, burglary" },
  { key:"economic",      label:"Economic",       icon:"📈", color:"#f59e0b", required:["unemployment"],optional:"medianIncome, gdpGrowth, businessOpenings, housingAffordability" },
  { key:"health",        label:"Healthcare",     icon:"🏥", color:"#10b981", required:["hospitalVisits"],optional:"icuOccupancy, avgResponseTime, vaccinationRate" },
  { key:"noise",         label:"Noise",          icon:"🔊", color:"#8b5cf6", required:["avgDecibels"], optional:"complaints, nighttimeNoise, constructionNoise, trafficNoise" },
  { key:"neighborhoods", label:"Neighborhoods",  icon:"📍", color:"#f97316", required:["name"],        optional:"airQuality, safety, greenSpace, healthcare, economic, noise, transport, livabilityScore" },
  { key:"sentiment",     label:"Sentiment",      icon:"💬", color:"#22c55e", required:["category","positive"], optional:"neutral, negative, total, trend" },
];

export function DataProvider({ children }) {
  const [uploadStatus, setUploadStatus] = useState({});   // { air_quality: { uploaded, rows, meta } }
  const [uploading,    setUploading]    = useState({});   // { air_quality: true/false }
  const [uploadErrors, setUploadErrors] = useState({});

  const refreshStatus = useCallback(async () => {
    try {
      const status = await api.get("/api/upload/status");
      // Full replace from server — guarantees totalUploaded updates correctly
      const normalized = {};
      for (const [k, v] of Object.entries(status)) {
        normalized[k] = {
          uploaded: v?.uploaded === true,
          rows:     v?.rows ?? 0,
          meta:     v?.meta ?? null,
        };
      }
      setUploadStatus(normalized);
    } catch (_) {}
  }, []);

  const uploadFile = useCallback(async (datasetType, file) => {
    setUploading(p => ({ ...p, [datasetType]: true }));
    setUploadErrors(p => ({ ...p, [datasetType]: null }));
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api.post(`/api/upload/${datasetType}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(p => ({
        ...p,
        [datasetType]: { uploaded: true, rows: result.rows, meta: result },
      }));
      return { success: true, ...result };
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Upload failed";
      setUploadErrors(p => ({ ...p, [datasetType]: msg }));
      return { success: false, error: msg };
    } finally {
      setUploading(p => ({ ...p, [datasetType]: false }));
    }
  }, []);

  const clearDataset = useCallback(async (datasetType) => {
    try {
      await api.delete(`/api/upload/${datasetType}`);
      setUploadStatus(p => ({ ...p, [datasetType]: { uploaded: false, rows: 0, meta: null } }));
      setUploadErrors(p => ({ ...p, [datasetType]: null }));
    } catch (_) {}
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.delete("/api/upload/");
      setUploadStatus({});
      setUploadErrors({});
    } catch (_) {}
  }, []);

  const isUploaded = (key) => uploadStatus[key]?.uploaded === true;
  const totalUploaded = Object.values(uploadStatus).filter(v => v?.uploaded).length;

  return (
    <DataContext.Provider value={{
      uploadStatus, uploading, uploadErrors,
      uploadFile, clearDataset, clearAll, refreshStatus,
      isUploaded, totalUploaded,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
