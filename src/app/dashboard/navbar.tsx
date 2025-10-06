"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, Laptop, Home, Settings, User, Plus, List, Ticket, Radio, File } from "lucide-react";
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

const NAVIGATION_ITEMS = [
 
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
            <span>LMA</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  pathname === item.href
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
          
          {/* Laptop Dropdown Menu */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Laptop className="h-4 w-4" />
                <span>Laptops</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Laptop Management</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/laptops" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>View Laptops</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/laptops" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Laptop</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
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
              <div className="flex flex-col gap-4 mt-8">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        pathname === item.href
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
                
                {/* Mobile Laptop Menu */}
                <div className="pt-4 border-t">
                  <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Laptop Management
                  </p>
                  <Link
                    href="/laptops"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <List className="h-4 w-4" />
                    <span>View Laptops</span>
                  </Link>
                  <Link
                    href="/laptops"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Laptop</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}