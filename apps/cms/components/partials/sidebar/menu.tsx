"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConfig } from "@/hooks/use-config";
import { adminMenu } from "@/lib/menus";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LogOut, Ellipsis } from "lucide-react";

export function Menu() {
  const pathname = usePathname();
  const router = useRouter();
  const [config] = useConfig();
  const collapsed = config.collapsed;

  // Local hover config (if collapsed, expanding on hover)
  const [hovered, setHovered] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const showLabel = !collapsed || hovered;

  return (
    <nav
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => collapsed && setHovered(false)}
      className="flex-1 flex flex-col justify-between py-6 px-4 overflow-y-auto overflow-x-hidden"
    >
      <div className="space-y-6">
        {adminMenu.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            {showLabel ? (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.groupLabel}
              </h4>
            ) : (
              <div className="w-full flex justify-center py-1">
                <Ellipsis className="h-4 w-4 text-muted-foreground/30" />
              </div>
            )}

            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <li key={itemIdx}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      color={isActive ? "default" : "secondary"}
                      fullWidth
                      size={!showLabel ? "icon" : "default"}
                      className={cn(
                        "hover:ring-transparent hover:ring-offset-0 text-sm font-medium transition-all duration-300",
                        showLabel ? "justify-start py-3 px-3 h-auto" : "justify-center h-9 w-9 p-0",
                        {
                          "bg-secondary text-default hover:bg-secondary":
                            isActive && config.sidebarColor !== "light",
                        }
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon
                          icon={item.icon}
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive ? "text-default-foreground" : "text-current",
                            showLabel && "me-2"
                          )}
                        />
                        {showLabel && (
                          <span className="truncate max-w-[150px]">{item.label}</span>
                        )}
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-default-100 dark:border-default-300">
        <Button
          variant="ghost"
          color="destructive"
          fullWidth
          size={!showLabel ? "icon" : "default"}
          onClick={handleLogout}
          className={cn(
            "hover:ring-transparent hover:ring-offset-0 text-sm font-medium transition-colors cursor-pointer",
            showLabel ? "justify-start py-3 px-3 h-auto" : "justify-center h-9 w-9 p-0"
          )}
        >
          <LogOut className={cn("h-5 w-5 shrink-0", showLabel && "me-2")} />
          {showLabel && <span>Sign Out</span>}
        </Button>
      </div>
    </nav>
  );
}
