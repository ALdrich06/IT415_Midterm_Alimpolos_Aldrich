import localFont from "next/font/local";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Brew & Bite Kiosk",
  description: "Touchscreen Point-of-Sale Kiosk System for Brew & Bite Cafe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cream-100 text-maroon-900`}
      >
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
