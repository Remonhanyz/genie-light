"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ShoppingBag, AlertTriangle } from "lucide-react";

interface NotificationTabsProps {
  activeTab: "orders" | "lowStock";
  ordersCount: number;
  lowStockCount: number;
  onTabChange: (tab: "orders" | "lowStock") => void;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  ordersCount,
  lowStockCount,
  onTabChange,
}) => {
  return (
    <div className="flex border-b border-border bg-muted/20 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onTabChange("orders")}
        className={cn(
          "flex-1 py-2 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
          activeTab === "orders"
            ? "border-primary text-primary font-bold bg-background"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <ShoppingBag className="h-3.5 w-3.5" /> Orders ({ordersCount})
      </button>
      <button
        type="button"
        onClick={() => onTabChange("lowStock")}
        className={cn(
          "flex-1 py-2 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
          activeTab === "lowStock"
            ? "border-amber-500 text-amber-600 font-bold bg-background"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Stock Warnings ({lowStockCount})
      </button>
    </div>
  );
};
