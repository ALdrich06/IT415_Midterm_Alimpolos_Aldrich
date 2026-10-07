"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function PaymentCash({ total, onBack, onConfirm, isProcessing }) {
  const [amountPaid, setAmountPaid] = useState("");
  const [error, setError] = useState("");

  const numericAmount = Number(amountPaid);
  const change = useMemo(() => {
    if (!amountPaid || Number.isNaN(numericAmount)) return null;
    return Math.round((numericAmount - total) * 100) / 100;
  }, [amountPaid, numericAmount, total]);

  function validate() {
    if (amountPaid.trim() === "") {
      return "Please enter the amount received from the customer.";
    }
    if (Number.isNaN(numericAmount)) {
      return "Please enter a valid number.";
    }
    if (numericAmount < 0) {
      return "Amount cannot be negative.";
    }
    if (numericAmount < total) {
      return "Insufficient amount. The amount paid is less than the total due.";
    }
    return "";
  }

  function handlePayNow() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onConfirm({ amountPaid: numericAmount, changeAmount: Math.round((numericAmount - total) * 100) / 100 });
  }

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-maroon-900">Cash Payment</h1>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm text-maroon-700/70">Total Amount Due</p>
        <p className="text-4xl font-extrabold text-maroon-600">{formatCurrency(total)}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <label htmlFor="amountPaid" className="mb-2 block text-sm font-semibold text-maroon-900">
          Amount Received
        </label>
        <input
          id="amountPaid"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amountPaid}
          onChange={(e) => {
            setAmountPaid(e.target.value);
            setError("");
          }}
          placeholder="0.00"
          className="tap-target w-full rounded-xl border-2 border-cream-200 px-4 py-3 text-2xl font-bold text-maroon-900 outline-none focus:border-maroon-400"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setAmountPaid(String(amount));
                setError("");
              }}
              className="tap-target rounded-full bg-cream-100 px-4 py-2 text-sm font-semibold text-maroon-700"
            >
              {formatCurrency(amount)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setAmountPaid(String(total));
              setError("");
            }}
            className="tap-target rounded-full bg-maroon-100 px-4 py-2 text-sm font-semibold text-maroon-700"
          >
            Exact Amount
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-maroon-50 p-3 text-sm font-semibold text-maroon-600">
            {error}
          </p>
        )}

        {change !== null && !error && change >= 0 && (
          <p className="mt-3 text-lg font-semibold text-maroon-900">
            Change: <span className="text-maroon-600">{formatCurrency(change)}</span>
          </p>
        )}
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
          onClick={handlePayNow}
          disabled={isProcessing}
          className="tap-target flex-1 rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card disabled:opacity-60"
        >
          {isProcessing ? "Processing…" : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
