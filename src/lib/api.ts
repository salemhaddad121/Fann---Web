import type { ApiErrorBody } from "@/types/auth";

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
//
// Note there's nothing to read/store here anymore: the access and refresh
// tokens live in httpOnly cookies the browser manages on its own. This
// just asks the API to rotate the access-token cookie and reports whether
// that worked — `credentials: "include"` is what makes the browser send
// the existing refreshToken cookie along with the request, and what makes
// it store the new Set-Cookie response.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // whether a 401 here should trigger a refresh-and-retry (default: true)
  retryOn401?: boolean; // internal, prevents infinite retry loops
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retryOn401 = true } = options;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send/receive the httpOnly accessToken/refreshToken cookies
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retryOn401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retryOn401: false });
    }
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
