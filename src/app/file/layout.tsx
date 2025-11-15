import { DashboardNavbar } from "@/app/dashboard/navbar";

interface FileLayoutProps {
  children: React.ReactNode;
}

export default function FileLayout({ children }: FileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <DashboardNavbar />
      <main className="py-4 md:py-8 px-4 container mx-auto">{children}</main>
    </div>
  );
}