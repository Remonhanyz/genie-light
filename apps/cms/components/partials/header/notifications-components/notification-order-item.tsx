"use client";

import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingBag, Trash2 } from "lucide-react";

interface NotificationOrderItemProps {
  order: any;
  isRead: boolean;
  onMarkAsRead: (id: string, e?: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export const NotificationOrderItem: React.FC<NotificationOrderItemProps> = ({
  order,
  isRead,
  onMarkAsRead,
  onRemove,
}) => {
  const isPending = order.status === "PENDING";

  return (
    <DropdownMenuItem
      onClick={() => {
        onMarkAsRead(order.id);
        window.location.href = `/admin/orders?orderId=${order.id}`;
      }}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer transition-colors duration-150 rounded-none relative group",
        !isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50 opacity-80"
      )}
    >
      <div className="flex-none mt-0.5">
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-background",
            isPending ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50" : "bg-emerald-100 text-emerald-700"
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <span
            className={cn(
              "text-xs capitalize truncate max-w-[150px]",
              !isRead ? "font-extrabold text-foreground" : "font-semibold text-muted-foreground"
            )}
          >
            Order #{order.id.substring(0, 8)} by {order.user?.username || "Guest"}
          </span>
          <span className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Total: <span className="font-bold text-foreground">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onRemove(order.id, e)}
        className="text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-none cursor-pointer"
        title="Remove notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </DropdownMenuItem>
  );
};
