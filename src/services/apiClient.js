/**
 * apiClient.js
 * Centralized HTTP API client with cookie credentials support,
 * local-to-cloud automatic fallback, error normalization, and timeout handling.
 */

const LOCAL_API_URL = "http://localhost:5000/api";
const CLOUD_API_URL = "https://learnwithus-11jz.onrender.com/api";

function resolveBaseUrl() {
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
      : null) ||
    (typeof process !== "undefined" && process.env
      ? process.env.VITE_API_BASE_URL || process.env.VITE_API_URL
      : null);
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }
  
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return LOCAL_API_URL;
  }
  return CLOUD_API_URL;
}

const PRIMARY_API_BASE_URL = resolveBaseUrl();

async function executeFetch(baseUrl, endpoint, options, timeoutMs = 12000) {
  const url = `${baseUrl}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("py_token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: controller.signal,
    credentials: "include"
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function request(endpoint, options = {}) {
  try {
    return await executeFetch(PRIMARY_API_BASE_URL, endpoint, options, options.timeoutMs || 10000);
  } catch (err) {
    // If local backend is unreachable (Failed to fetch / Connection refused),
    // automatically try the live cloud backend as fallback so the user is never blocked!
    const isNetworkError = err.name === "TypeError" || (err.message && err.message.includes("Failed to fetch"));
    if (PRIMARY_API_BASE_URL === LOCAL_API_URL && isNetworkError) {
      console.warn(`Local backend on :5000 not reachable. Attempting fallback to cloud backend (${CLOUD_API_URL})...`);
      try {
        return await executeFetch(CLOUD_API_URL, endpoint, options, options.timeoutMs || 15000);
      } catch (cloudErr) {
        if (cloudErr.name === "AbortError") {
          const timeoutErr = new Error("Request timed out. The server might be spinning up or offline.");
          timeoutErr.status = 504;
          throw timeoutErr;
        }
        if (cloudErr.name === "TypeError" && cloudErr.message && cloudErr.message.includes("Failed to fetch")) {
          const offlineErr = new Error("Backend server is unreachable. Start local server with 'npm run server' or check internet connection.");
          offlineErr.status = 503;
          throw offlineErr;
        }
        throw cloudErr;
      }
    }

    if (err.name === "AbortError") {
      const timeoutErr = new Error("Request timed out. The server might be spinning up or offline.");
      timeoutErr.status = 504;
      throw timeoutErr;
    }

    if (err.name === "TypeError" && err.message && err.message.includes("Failed to fetch")) {
      const offlineErr = new Error("Backend server is unreachable. Start local server with 'npm run server' or check internet connection.");
      offlineErr.status = 503;
      throw offlineErr;
    }

    throw err;
  }
}

export const apiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: "DELETE" });
  }
};
