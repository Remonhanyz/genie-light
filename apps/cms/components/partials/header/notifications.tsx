"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bell, ShoppingBag, Loader2, CheckCheck, Check } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationTabs } from "./notifications-components/notification-tabs";
import { NotificationOrderItem } from "./notifications-components/notification-order-item";
import { NotificationStockItem } from "./notifications-components/notification-stock-item";

export default function Notifications() {
  const {
    activeTab,
    setActiveTab,
    readMap,
    isLoading,
    visibleOrders,
    visibleLowStockProducts,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleRemoveNotification,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex items-center justify-center md:h-8 md:w-8 h-9 w-9 rounded-full md:bg-secondary bg-transparent text-secondary-foreground cursor-pointer focus:outline-none transition-all duration-200 hover:bg-secondary/80"
          title="System Notifications"
        >
          <Bell className={cn("h-4.5 w-4.5", unreadCount > 0 && "animate-bounce")} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-[10px] rounded-full font-bold flex items-center justify-center bg-red-600 hover:bg-red-600 text-white border-2 border-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-[380px] p-0 rounded-xl border border-border shadow-lg bg-popover text-popover-foreground overflow-hidden"
      >
        <DropdownMenuLabel className="p-0">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Read all
                </button>
              )}
            </div>
          </div>

          <NotificationTabs
            activeTab={activeTab}
            ordersCount={visibleOrders.length}
            lowStockCount={visibleLowStockProducts.length}
            onTabChange={setActiveTab}
          />
        </DropdownMenuLabel>

        <div className="h-[320px]">
          <ScrollArea className="h-full">
            {activeTab === "orders" ? (
              visibleOrders.length === 0 ? (
                <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mb-2 opacity-40" />
                  <span className="text-sm font-medium">No order notifications</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {visibleOrders.slice(0, 15).map((o: any) => (
                    <NotificationOrderItem
                      key={o.id}
                      order={o}
                      isRead={!!readMap[o.id]}
                      onMarkAsRead={handleMarkAsRead}
                      onRemove={handleRemoveNotification}
                    />
                  ))}
                </div>
              )
            ) : visibleLowStockProducts.length === 0 ? (
              <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <Check className="h-8 w-8 mb-2 text-emerald-500 opacity-60" />
                <span className="text-sm font-medium text-foreground">Stock levels healthy</span>
                <span className="text-xs text-muted-foreground">All items have sufficient inventory.</span>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleLowStockProducts.map((p: any) => (
                  <NotificationStockItem
                    key={p.id}
                    product={p}
                    isRead={!!readMap[`ls_${p.id}`]}
                    onMarkAsRead={handleMarkAsRead}
                    onRemove={handleRemoveNotification}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
