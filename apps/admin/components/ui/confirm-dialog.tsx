"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-default-200 dark:border-default-800">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className={`p-2.5 rounded-full flex-none ${variant === "destructive" ? "bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-primary/10 text-primary"}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-default-200 dark:border-default-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            color={variant === "destructive" ? "destructive" : "primary"}
            onClick={() => {
              onConfirm();
            }}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
