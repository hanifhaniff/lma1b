import { DashboardNavbar } from "@/app/dashboard/navbar";

interface VoucherLayoutProps {
  children: React.ReactNode;
}

export default function VoucherLayout({ children }: VoucherLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <DashboardNavbar />
      <main className="py-4 md:py-8 px-4 container mx-auto">{children}</main>
    </div>
  );
}