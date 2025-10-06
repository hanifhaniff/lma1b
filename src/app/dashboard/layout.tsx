import { DashboardNavbar } from "./navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}