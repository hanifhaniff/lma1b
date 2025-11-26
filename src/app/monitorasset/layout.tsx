import { MonitorNavbar } from "@/components/monitor-navbar";

export default function MonitorAssetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <MonitorNavbar />
      <main className="py-4 md:py-8 px-4 container mx-auto">{children}</main>
    </div>
  );
}
