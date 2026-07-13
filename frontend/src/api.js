const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, { token, ...options } = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(typeof detail === "string" ? detail : detail[0]?.msg || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export function register(email, password) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function login(email, password) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function fetchMe(token) {
  return request("/api/auth/me", { token });
}

export function fetchFeed(token) {
  return request("/api/feed", { token });
}

export function fetchSubscriptions(token) {
  return request("/api/subscriptions", { token });
}

export function addSubscription(token, { platform, identifier, display_name }) {
  return request("/api/subscriptions", {
    method: "POST",
    token,
    body: JSON.stringify({ platform, identifier, display_name }),
  });
}

export function removeSubscription(token, id) {
  return request(`/api/subscriptions/${id}`, { method: "DELETE", token });
}
