"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface OrderEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  editForm: { status: string; address: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ status: string; address: string }>>;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export function OrderEditModal({
  open,
  onOpenChange,
  order,
  editForm,
  setEditForm,
  onSave,
  saving,
}: OrderEditModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Order Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm border-b pb-2">
              <p className="font-semibold text-foreground">Order #{order.id.substring(0, 8)}</p>
              <p className="text-muted-foreground text-xs">
                Customer: {order.user?.username} ({order.user?.email})
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Tracking Status</Label>
              <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="SHIPPING">SHIPPING</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-address">Shipping Address</Label>
              <Textarea
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="min-h-[90px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="cursor-pointer">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
