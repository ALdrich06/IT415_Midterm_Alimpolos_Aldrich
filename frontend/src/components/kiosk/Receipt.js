"use client";

import { formatCurrency, formatDateTime } from "@/lib/format";

const METHOD_LABELS = { cash: "Cash", qr: "QR Payment", card: "Credit / Debit Card" };

export default function Receipt({ transaction, onBack, onNewTransaction }) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-6">
      <div id="printable-receipt" className="rounded-2xl bg-white p-6 font-mono shadow-card">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-extrabold text-maroon-900">BREW &amp; BITE KIOSK</h1>
          <p className="text-xs text-maroon-700/70">Self-Service Café Kiosk</p>
        </div>

        <div className="mb-3 border-y border-dashed border-maroon-300 py-2 text-sm">
          <div className="flex justify-between">
            <span>Transaction No.</span>
            <span className="font-bold">{transaction.transaction_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date/Time</span>
            <span>{formatDateTime(transaction.created_at)}</span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-maroon-300 text-left">
              <th className="py-1">Item</th>
              <th className="py-1 text-center">Qty</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {transaction.items.map((item) => (
              <tr key={item.id || item.product_name}>
                <td className="py-1">{item.product_name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-1 text-right">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 space-y-1 border-t border-dashed border-maroon-300 pt-2 text-sm">
          <div className="flex justify-between text-base font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span>{METHOD_LABELS[transaction.payment_method] || transaction.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid</span>
            <span>{formatCurrency(transaction.amount_paid)}</span>
          </div>
          <div className="flex justify-between">
            <span>Change</span>
            <span>{formatCurrency(transaction.change_amount)}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-bold text-maroon-600">PAYMENT SUCCESSFUL</p>
        <p className="mt-2 text-center text-xs text-maroon-700/70">Thank you for your order!</p>
      </div>

      <div className="no-print flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="tap-target flex-1 rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="tap-target flex-1 rounded-xl bg-maroon-100 py-4 text-lg font-bold text-maroon-700 shadow-card"
        >
          Print Receipt
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
