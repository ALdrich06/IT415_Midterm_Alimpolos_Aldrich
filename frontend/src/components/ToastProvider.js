"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#4d1220",
          color: "#fdf6e9",
          fontSize: "1rem",
          padding: "0.75rem 1rem",
        },
        success: {
          iconTheme: { primary: "#fdf6e9", secondary: "#4d1220" },
        },
        error: {
          style: { background: "#7f1f36", color: "#fff" },
        },
      }}
    />
  );
}
