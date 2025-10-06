import { LinkNavbar } from "./navbar";

export default function LinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LinkNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}