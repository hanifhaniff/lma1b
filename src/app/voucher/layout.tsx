import { DashboardNavbar } from "@/app/dashboard/navbar";

interface VoucherLayoutProps {
  children: React.ReactNode;
}

export default function VoucherLayout({ children }: VoucherLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}