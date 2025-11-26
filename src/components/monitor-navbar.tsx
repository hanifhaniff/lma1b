"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Satellite, Package } from "lucide-react";

const navItems = [
  {
    title: "Starlink",
    href: "/starlink",
    icon: Satellite,
    description: "Monitoring Pemakaian Starlink",
  },
  {
    title: "Aset IT",
    href: "/monitorasset",
    icon: Package,
    description: "Data Aset IT",
  },
];

export function MonitorNavbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-white">
              <Image 
                src="/lma.png" 
                alt="LMA Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-lg text-gray-900">Monitoring Dashboard</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
