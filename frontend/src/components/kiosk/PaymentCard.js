"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

export default function PaymentCard({ total, onBack, onConfirm, isProcessing }) {
  const [simulating, setSimulating] = useState(false);

  function handleProcessPayment() {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      onConfirm({ amountPaid: total, changeAmount: 0 });
    }, 1500);
  }

  const busy = simulating || isProcessing;

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-maroon-900">Credit / Debit Card</h1>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-maroon-700/70">Amount Due</p>
        <p className="text-4xl font-extrabold text-maroon-600">{formatCurrency(total)}</p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-card">
        <span className="text-6xl">💳</span>
        {busy ? (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-maroon-200 border-t-maroon-600" />
            <p className="font-semibold text-maroon-700">Processing your card payment…</p>
          </>
        ) : (
          <p className="max-w-sm text-center text-lg font-semibold text-maroon-900">
            Please tap, insert, or swipe your card.
          </p>
        )}
        <p className="max-w-sm text-center text-xs text-maroon-700/60">
          Simulation only — no real card details are requested, collected, or stored.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="tap-target flex-1 rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleProcessPayment}
          disabled={busy}
          className="tap-target flex-1 rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card disabled:opacity-60"
        >
          {busy ? "Processing…" : "Process Payment"}
        </button>
      </div>
    </div>
  );
}
