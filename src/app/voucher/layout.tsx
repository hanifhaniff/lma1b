import { DashboardNavbar } from "@/app/dashboard/navbar";

export default function VoucherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}