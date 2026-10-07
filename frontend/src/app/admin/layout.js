import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Dashboard - Brew & Bite Kiosk",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
