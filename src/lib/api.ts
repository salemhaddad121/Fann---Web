import type { ApiErrorBody } from "@/types/auth";
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "@/lib/tokens";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extractMessage(body: ApiErrorBody | undefined, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message[0] : body.message;
}

// Only ONE refresh call in flight at a time, even if several requests
// 401 at once — every caller waiting gets the same promise.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // attach the access token (default: true)
  retryOn401?: boolean; // internal, prevents infinite retry loops
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retryOn401 = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, retryOn401: false });
    }
    clearTokens();
  }

  if (!res.ok) {
    let payload: ApiErrorBody | undefined;
    try {
      payload = await res.json();
    } catch {
      // no JSON body — fall through to generic message
    }
    throw new ApiError(res.status, extractMessage(payload, "Something went wrong. Please try again."));
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
