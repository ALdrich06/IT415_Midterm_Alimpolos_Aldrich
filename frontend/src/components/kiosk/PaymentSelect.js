"use client";

import { formatCurrency } from "@/lib/format";

const METHODS = [
  { id: "cash", label: "Cash", icon: "💵", description: "Pay with cash at the counter" },
  { id: "qr", label: "QR Payment", icon: "📱", description: "Scan to pay with your e-wallet" },
  { id: "card", label: "Credit / Debit Card", icon: "💳", description: "Tap, insert, or swipe" },
];

export default function PaymentSelect({ total, onSelect, onBack }) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-maroon-900">Select Payment Method</h1>
        <p className="mt-1 text-xl font-bold text-maroon-600">
          Total Due: {formatCurrency(total)}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className="tap-target flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 text-center shadow-card transition hover:shadow-card-hover active:scale-[0.98]"
          >
            <span className="text-5xl">{method.icon}</span>
            <span className="text-xl font-bold text-maroon-900">{method.label}</span>
            <span className="text-sm text-maroon-700/70">{method.description}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="tap-target rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card"
      >
        Back to Order Summary
      </button>
    </div>
  );
}
