"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import StatCard from "@/components/admin/StatCard";
import { adminFetchStats } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

const METHOD_LABELS = { cash: "Cash", qr: "QR Payment", card: "Card" };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard statistics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-maroon-700/70">Loading dashboard…</p>;
  }

  if (!stats) {
    return <p className="text-maroon-700/70">No data available.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-maroon-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sales" value={formatCurrency(stats.totalSales)} accent />
        <StatCard label="Total Transactions" value={stats.totalTransactions} />
        <StatCard label="Available Products" value={stats.availableProducts} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold text-maroon-900">Payment Method Breakdown</h2>
          <ul className="flex flex-col gap-3">
            {Object.entries(stats.paymentBreakdown).map(([method, total]) => (
              <li key={method} className="flex items-center justify-between">
                <span className="font-semibold text-maroon-700">{METHOD_LABELS[method] || method}</span>
                <span className="font-bold text-maroon-900">{formatCurrency(total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-maroon-900">Recent Transactions</h2>
            <Link href="/admin/transactions" className="text-sm font-semibold text-maroon-600 underline">
              View all
            </Link>
          </div>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-sm text-maroon-700/70">No transactions yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-cream-200">
              {stats.recentTransactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-maroon-900">{t.transaction_number}</p>
                    <p className="text-xs text-maroon-700/60">{formatDateTime(t.created_at)}</p>
                  </div>
                  <span className="font-bold text-maroon-600">{formatCurrency(t.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
