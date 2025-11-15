import { LinkNavbar } from "./navbar";

export default function LinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <LinkNavbar />
      <main className="py-4 md:py-8 px-4 container mx-auto">{children}</main>
    </div>
  );
}