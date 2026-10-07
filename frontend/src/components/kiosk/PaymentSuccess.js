"use client";

import { formatCurrency } from "@/lib/format";

const METHOD_LABELS = { cash: "Cash", qr: "QR Payment", card: "Credit / Debit Card" };

export default function PaymentSuccess({ transaction, onViewReceipt, onNewTransaction }) {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-maroon-600 text-5xl text-cream-50">
        ✓
      </div>
      <h1 className="text-3xl font-extrabold text-maroon-900">Payment Successful!</h1>
      <p className="text-maroon-700/80">Thank you for your order.</p>

      <div className="w-full rounded-2xl bg-white p-6 text-left shadow-card">
        <dl className="grid grid-cols-2 gap-y-3">
          <dt className="text-maroon-700/70">Transaction No.</dt>
          <dd className="text-right font-bold text-maroon-900">{transaction.transaction_number}</dd>

          <dt className="text-maroon-700/70">Payment Method</dt>
          <dd className="text-right font-semibold text-maroon-900">
            {METHOD_LABELS[transaction.payment_method] || transaction.payment_method}
          </dd>

          <dt className="text-maroon-700/70">Total Amount</dt>
          <dd className="text-right font-semibold text-maroon-900">
            {formatCurrency(transaction.total)}
          </dd>

          <dt className="text-maroon-700/70">Amount Paid</dt>
          <dd className="text-right font-semibold text-maroon-900">
            {formatCurrency(transaction.amount_paid)}
          </dd>

          <dt className="text-maroon-700/70">Change</dt>
          <dd className="text-right font-semibold text-maroon-900">
            {formatCurrency(transaction.change_amount)}
          </dd>
        </dl>
      </div>

      <div className="flex w-full gap-4">
        <button
          type="button"
          onClick={onViewReceipt}
          className="tap-target flex-1 rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card"
        >
          View Receipt
        </button>
        <button
          type="button"
          onClick={onNewTransaction}
          className="tap-target flex-1 rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card"
        >
          New Transaction
        </button>
      </div>
    </div>
  );
}
