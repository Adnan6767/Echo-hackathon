import axios, { type AxiosInstance } from 'axios';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000/api';

const ENV_USE_MOCK =
  ((import.meta.env.VITE_USE_MOCK_DATA as string | undefined) ?? 'true').toLowerCase() !== 'false';

const MODE_STORAGE_KEY = 'echo_api_mode_override';

let useMockMode: boolean = (() => {
  if (typeof window !== 'undefined') {
    const override = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (override === 'true') return true;
    if (override === 'false') return false;
  }
  return ENV_USE_MOCK;
})();

const modeListeners = new Set<() => void>();

export function isMockModeEnabled(): boolean {
  return useMockMode;
}

export function setMockModeEnabled(next: boolean) {
  useMockMode = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MODE_STORAGE_KEY, String(next));
  }
  modeListeners.forEach((fn) => fn());
}

export function subscribeApiMode(fn: () => void): () => void {
  modeListeners.add(fn);
  return () => modeListeners.delete(fn);
}

/**
 * Centralized Axios client configured for the Python FastAPI backend.
 * Note: For multipart/form-data uploads, callers MUST pass FormData without
 * manually overriding the Content-Type header so the browser attaches the boundary.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return `Unable to reach Python backend at ${API_BASE_URL}. Switch to Sample Demo Mode to test interactively without a live server.`;
    }
    const detail = (error.response.data as { detail?: string; message?: string } | undefined);
    return detail?.detail || detail?.message || `Backend error (${error.response.status})`;
  }
  if (error instanceof Error) return error.message;
  return 'Unexpected network error occurred.';
}
