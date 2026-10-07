"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Login failed. Please check your email and password.");
      toast.error("Login failed");
      return;
    }

    toast.success("Welcome back!");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card-hover"
      >
        <h1 className="mb-1 text-2xl font-extrabold text-maroon-900">Admin Login</h1>
        <p className="mb-6 text-sm text-maroon-700/70">Brew &amp; Bite Kiosk Dashboard</p>

        <label className="mb-1 block text-sm font-semibold text-maroon-900" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-cream-200 px-4 py-3 outline-none focus:border-maroon-400"
          placeholder="admin@example.com"
        />

        <label className="mb-1 block text-sm font-semibold text-maroon-900" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border-2 border-cream-200 px-4 py-3 outline-none focus:border-maroon-400"
          placeholder="••••••••"
        />

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-maroon-50 p-3 text-sm font-semibold text-maroon-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-maroon-600 py-3 text-lg font-bold text-cream-50 shadow-card disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
