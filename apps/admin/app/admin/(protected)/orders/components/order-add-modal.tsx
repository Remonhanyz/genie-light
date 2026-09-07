"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  products: any[];
  addForm: {
    userId: string;
    paymentType: string;
    status: string;
    address: string;
    items: Array<{ productId: string; quantity: number }>;
  };
  setAddForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
}

export function OrderAddModal({
  open,
  onOpenChange,
  users,
  products,
  addForm,
  setAddForm,
  onSave,
  saving,
}: OrderAddModalProps) {
  const handleAddOrderItem = () => {
    if (products.length === 0) return;
    setAddForm((prev: any) => ({
      ...prev,
      items: [...prev.items, { productId: products[0].id, quantity: 1 }],
    }));
  };

  const handleRemoveOrderItem = (index: number) => {
    if (addForm.items.length <= 1) return;
    setAddForm((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const updated = [...addForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setAddForm((prev: any) => ({ ...prev, items: updated }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <form onSubmit={onSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create New Store Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-user">Select Customer Account *</Label>
              <Select
                value={addForm.userId}
                onValueChange={(val) => {
                  const u = users.find((item) => item.id === val);
                  setAddForm({ ...addForm, userId: val, address: u?.address || addForm.address });
                }}
              >
                <SelectTrigger id="add-user">
                  <SelectValue placeholder="Select User Account" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-payment">Payment Method *</Label>
                <Select value={addForm.paymentType} onValueChange={(val) => setAddForm({ ...addForm, paymentType: val })}>
                  <SelectTrigger id="add-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-status">Initial Status</Label>
                <Select value={addForm.status} onValueChange={(val) => setAddForm({ ...addForm, status: val })}>
                  <SelectTrigger id="add-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="SHIPPING">SHIPPING</SelectItem>
                    <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-address">Shipping Delivery Address *</Label>
              <Textarea
                id="add-address"
                placeholder="Street, Building, Flat, City..."
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs">Order Item Contents (Triggers Barcodes)</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOrderItem} className="h-7 text-xs cursor-pointer">
                  + Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {addForm.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 border p-2 rounded-md bg-muted/30">
                    <div className="flex-1">
                      <Select value={item.productId} onValueChange={(val) => handleOrderItemChange(idx, "productId", val)}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({formatCurrency(p.isOnSale && p.salePrice ? p.salePrice : p.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={item.quantity}
                        onChange={(e) => handleOrderItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="h-8 text-xs text-center"
                      />
                    </div>
                    {addForm.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOrderItem(idx)}
                        className="h-8 w-8 text-destructive cursor-pointer"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="cursor-pointer gap-1.5">
              <Check className="h-4 w-4" /> {saving ? "Creating Order..." : "Create & Generate Barcodes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
