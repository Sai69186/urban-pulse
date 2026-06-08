/**
 * Urban Pulse API Client
 * Centralized axios instance with interceptors and error handling
 */

import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — unwrap data, log errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("[API Error]", error?.response?.status, error?.config?.url);
    return Promise.reject(error);
  }
);

export default api;
