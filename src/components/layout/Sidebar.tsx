"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="group/sidebar hidden w-16 shrink-0 flex-col border-r bg-background transition-all duration-300 hover:w-60 md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold tracking-tight">B</span>
        <span className="overflow-hidden whitespace-nowrap text-lg font-bold tracking-tight opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
          WATS
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3"
        >
          {theme === "dark" ? (
            <Sun className="size-5 shrink-0" />
          ) : (
            <Moon className="size-5 shrink-0" />
          )}
          <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </Button>
      </div>
    </aside>
  );
}
