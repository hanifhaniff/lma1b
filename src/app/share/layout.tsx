export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <main className="flex items-center justify-center p-4 container mx-auto">{children}</main>
    </div>
  );
}