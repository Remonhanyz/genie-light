"use client";

import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Package, Trash2 } from "lucide-react";

interface NotificationStockItemProps {
  product: any;
  isRead: boolean;
  onMarkAsRead: (id: string, e?: React.MouseEvent) => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export const NotificationStockItem: React.FC<NotificationStockItemProps> = ({
  product,
  isRead,
  onMarkAsRead,
  onRemove,
}) => {
  const notificationId = `ls_${product.id}`;

  return (
    <DropdownMenuItem
      onClick={() => {
        onMarkAsRead(notificationId);
        window.location.href = `/admin/products/${product.id}/edit`;
      }}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer transition-colors duration-150 rounded-none relative group",
        !isRead ? "bg-amber-500/10 hover:bg-amber-500/15" : "hover:bg-muted/50 opacity-80"
      )}
    >
      <div className="flex-none mt-0.5">
        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center ring-2 ring-background">
          <Package className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <span
            className={cn(
              "text-xs truncate max-w-[150px]",
              !isRead ? "font-extrabold text-foreground" : "font-semibold text-muted-foreground"
            )}
          >
            {product.name}
          </span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full">
            {product.inventory === 0 ? "OUT OF STOCK" : `${product.inventory} left`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          Category: <span className="font-medium">{product.category?.name || "General"}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => onRemove(notificationId, e)}
        className="text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex-none cursor-pointer"
        title="Remove notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </DropdownMenuItem>
  );
};
