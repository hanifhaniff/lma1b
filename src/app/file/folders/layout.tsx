interface FileFoldersLayoutProps {
  children: React.ReactNode;
}

export default function FileFoldersLayout({ children }: FileFoldersLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
}