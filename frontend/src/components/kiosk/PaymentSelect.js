"use client";

import { formatCurrency } from "@/lib/format";
import Image from "next/image";
import KioskBrand from "./KioskBrand";

const METHODS = [
  { id: "cash", label: "Cash", image: "/kiosk/payment-cash.png", description: "Pay with cash at the counter" },
  { id: "qr", label: "QR Payment", image: "/kiosk/payment-qr.png", description: "Scan to pay with your e-wallet" },
  { id: "card", label: "Credit / Debit Card", image: "/kiosk/payment-card.png", description: "Tap, insert, or swipe" },
];

export default function PaymentSelect({ total, onSelect, onBack }) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-maroon-900">Select Payment Method</h1>
          <p className="mt-1 text-xl font-bold text-maroon-600">
            Total Due: {formatCurrency(total)}
          </p>
        </div>
        <KioskBrand compact />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className="tap-target group flex flex-col items-center justify-center gap-4 rounded-2xl border border-maroon-100/50 bg-white p-6 text-center shadow-card transition hover:border-maroon-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-maroon-300 active:scale-[0.98] sm:p-8"
          >
            <div className="flex h-36 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-cream-100 to-white sm:h-44">
              <Image
                src={method.image}
                alt=""
                width={1280}
                height={1280}
                sizes="(max-width: 639px) 144px, 176px"
                className="h-36 w-36 object-contain transition-transform group-hover:scale-105 sm:h-44 sm:w-44"
              />
            </div>
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
