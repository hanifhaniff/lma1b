import { DashboardNavbar } from "@/app/dashboard/navbar";

interface FileLayoutProps {
  children: React.ReactNode;
}

export default function FileLayout({ children }: FileLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}