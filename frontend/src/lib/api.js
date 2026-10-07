import { getSupabaseBrowserClient } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.message || "Something went wrong. Please try again.", res.status, data);
  }

  return data;
}

// ---- Public / Kiosk endpoints ----
export const fetchProducts = () => request("/api/products");

export const createTransaction = (payload) =>
  request("/api/transactions", { method: "POST", body: payload });

// ---- Admin endpoints (require Supabase auth session) ----
export const adminFetchAllProducts = () => request("/api/products/all", { auth: true });

export const adminCreateProduct = (payload) =>
  request("/api/products", { method: "POST", body: payload, auth: true });

export const adminUpdateProduct = (id, payload) =>
  request(`/api/products/${id}`, { method: "PUT", body: payload, auth: true });

export const adminDeleteProduct = (id) =>
  request(`/api/products/${id}`, { method: "DELETE", auth: true });

export const adminFetchStats = () => request("/api/admin/stats", { auth: true });

export const adminFetchTransactions = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return request(`/api/admin/transactions${query ? `?${query}` : ""}`, { auth: true });
};

export const adminFetchTransactionDetail = (id) =>
  request(`/api/admin/transactions/${id}`, { auth: true });

export { ApiError };
