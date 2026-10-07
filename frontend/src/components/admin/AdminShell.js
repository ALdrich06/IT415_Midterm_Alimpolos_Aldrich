"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/transactions", label: "Transactions" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-cream-100">
      <aside className="flex w-60 flex-col bg-maroon-700 text-cream-50">
        <div className="p-6">
          <h1 className="text-xl font-extrabold">Brew &amp; Bite</h1>
          <p className="text-xs text-cream-100/70">Admin Dashboard</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-3 font-semibold transition ${
                  active ? "bg-maroon-600" : "hover:bg-maroon-600/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-maroon-900/40 px-4 py-3 text-left font-semibold hover:bg-maroon-900/60"
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
