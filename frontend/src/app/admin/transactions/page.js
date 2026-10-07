"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminFetchTransactions } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

const METHOD_LABELS = { cash: "Cash", qr: "QR Payment", card: "Card" };
const PAGE_SIZE = 20;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    setLoading(true);
    adminFetchTransactions({ search, paymentMethod, page, limit: PAGE_SIZE })
      .then((data) => {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, [search, paymentMethod, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-maroon-900">Transactions</h1>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search transaction number…"
          className="w-64 rounded-xl border-2 border-cream-200 px-4 py-2 outline-none focus:border-maroon-400"
        />
        <select
          value={paymentMethod}
          onChange={(e) => {
            setPage(1);
            setPaymentMethod(e.target.value);
          }}
          className="rounded-xl border-2 border-cream-200 px-4 py-2 outline-none focus:border-maroon-400"
        >
          <option value="">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="qr">QR Payment</option>
          <option value="card">Card</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-maroon-700/70">
              <th className="p-4">Transaction No.</th>
              <th className="p-4">Date/Time</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Total</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-maroon-700/70">
                  Loading transactions…
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-maroon-700/70">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-cream-100 last:border-0">
                  <td className="p-4 font-semibold text-maroon-900">{t.transaction_number}</td>
                  <td className="p-4 text-maroon-700">{formatDateTime(t.created_at)}</td>
                  <td className="p-4 text-maroon-700">
                    {METHOD_LABELS[t.payment_method] || t.payment_method}
                  </td>
                  <td className="p-4 font-semibold text-maroon-600">{formatCurrency(t.total)}</td>
                  <td className="p-4">
                    <Link href={`/admin/transactions/${t.id}`} className="font-semibold text-maroon-600 underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-maroon-700 shadow-card disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-maroon-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-maroon-700 shadow-card disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
