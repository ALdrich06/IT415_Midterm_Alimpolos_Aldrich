"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminFetchTransactionDetail } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

const METHOD_LABELS = { cash: "Cash", qr: "QR Payment", card: "Credit / Debit Card" };

export default function AdminTransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchTransactionDetail(id)
      .then((data) => setTransaction(data.transaction))
      .catch(() => toast.error("Transaction not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-maroon-700/70">Loading…</p>;
  if (!transaction) return <p className="text-maroon-700/70">Transaction not found.</p>;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push("/admin/transactions")}
        className="self-start font-semibold text-maroon-600 underline"
      >
        ← Back to Transactions
      </button>

      <h1 className="text-2xl font-extrabold text-maroon-900">{transaction.transaction_number}</h1>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-maroon-700/70">Date/Time</dt>
          <dd className="text-right font-semibold">{formatDateTime(transaction.created_at)}</dd>
          <dt className="text-maroon-700/70">Payment Method</dt>
          <dd className="text-right font-semibold">
            {METHOD_LABELS[transaction.payment_method] || transaction.payment_method}
          </dd>
          <dt className="text-maroon-700/70">Amount Paid</dt>
          <dd className="text-right font-semibold">{formatCurrency(transaction.amount_paid)}</dd>
          <dt className="text-maroon-700/70">Change</dt>
          <dd className="text-right font-semibold">{formatCurrency(transaction.change_amount)}</dd>
          <dt className="text-maroon-900 text-base font-bold">Total</dt>
          <dd className="text-right text-base font-bold text-maroon-600">
            {formatCurrency(transaction.total)}
          </dd>
        </dl>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-3 text-lg font-bold text-maroon-900">Items Purchased</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-maroon-700/70">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item) => (
              <tr key={item.id} className="border-b border-cream-100 last:border-0">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
