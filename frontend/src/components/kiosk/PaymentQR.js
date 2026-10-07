"use client";

import { formatCurrency } from "@/lib/format";

export default function PaymentQR({ total, onBack, onConfirm, isProcessing }) {
  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-maroon-900">QR Payment</h1>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-maroon-700/70">Amount Due</p>
        <p className="text-4xl font-extrabold text-maroon-600">{formatCurrency(total)}</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-card">
        <div className="flex h-56 w-56 items-center justify-center rounded-xl border-4 border-dashed border-maroon-200 bg-cream-50">
          <span className="px-4 text-center text-sm font-semibold text-maroon-500">
            QR CODE PLACEHOLDER
            <br />
            (Simulated Payment)
          </span>
        </div>
        <p className="max-w-sm text-center text-maroon-700/80">
          Open your e-wallet or banking app and scan this code to pay{" "}
          <strong>{formatCurrency(total)}</strong>. This is a simulation — no real payment
          gateway is connected.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="tap-target flex-1 rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onConfirm({ amountPaid: total, changeAmount: 0 })}
          disabled={isProcessing}
          className="tap-target flex-1 rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card disabled:opacity-60"
        >
          {isProcessing ? "Confirming…" : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
}
