"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, Laptop, Home, Settings, User, Plus, List, Ticket, Radio, File, Link as LinkIcon, ChevronDown, Satellite } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define TypeScript interfaces for better type safety
interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hasDropdown?: boolean;
  dropdownItems?: DropdownMenuItem[];
}

interface DropdownMenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Define dropdown items separately for better maintainability
const fileDropdownItems: DropdownMenuItem[] = [
  {
    title: "Upload Files",
    href: "/file",
    icon: File,
  },
  {
    title: "Manage Links",
    href: "/link",
    icon: LinkIcon,
  },
];

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Laptops",
    href: "/laptops",
    icon: Laptop,
  },
  {
    title: "Files",
    href: "/file",
    icon: File,
    hasDropdown: true,
    dropdownItems: fileDropdownItems,
  },
  {
    title: "Voucher",
    href: "/voucher",
    icon: Ticket,
  },
  {
    title: "Radio",
    href: "/radio",
    icon: Radio,
  },
  {
    title: "Starlink",
    href: "/net-usage",
    icon: Satellite,
  }
];

export function DashboardNavbar() {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image
              src="/lma.png"
              alt="LMA Logo"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold">LMA</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium" aria-label="Main navigation">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.hasDropdown && item.dropdownItems) {
              return (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      aria-expanded="false"
                      aria-haspopup="menu"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuLabel>{item.title} Management</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.dropdownItems.map((dropdownItem) => {
                      const DropdownIcon = dropdownItem.icon;
                      return (
                        <DropdownMenuItem key={dropdownItem.href} asChild>
                          <Link
                            href={dropdownItem.href}
                            className="flex items-center gap-2"
                          >
                            <DropdownIcon className="h-4 w-4" aria-hidden="true" />
                            <span>{dropdownItem.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  pathname === item.href
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px]">
              <div className="flex flex-col gap-1 mt-8">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  if (item.hasDropdown && item.dropdownItems) {
                    return (
                      <div key={item.href} className="mb-2">
                        <p className="px-3 py-2 text-sm font-medium text-foreground uppercase tracking-wider bg-muted rounded-t-lg">
                          {item.title} Management
                        </p>
                        <div className="pl-2">
                          {item.dropdownItems.map((dropdownItem) => {
                            const DropdownIcon = dropdownItem.icon;
                            return (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                  pathname === dropdownItem.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setOpen(false)}
                                aria-current={pathname === dropdownItem.href ? "page" : undefined}
                              >
                                <DropdownIcon className="h-4 w-4" aria-hidden="true" />
                                <span>{dropdownItem.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}