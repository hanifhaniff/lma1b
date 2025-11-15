import { StarlinkNavbar } from '@/components/starlink-navbar';

export default function StarlinkUsageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <StarlinkNavbar />
      <main>{children}</main>
    </div>
  );
}