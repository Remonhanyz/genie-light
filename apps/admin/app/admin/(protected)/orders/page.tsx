"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n-client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Eye, Edit, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { StickerGeneratorModal } from "@/components/ui";
import { TableLoader } from "@/components/ui/table-loader";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSortableData } from "@/hooks/use-sortable-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccessRestricted } from "@/components/auth/access-restricted";

// Sub-components
import { OrderDetailModal } from "./components/order-detail-modal";
import { OrderEditModal } from "./components/order-edit-modal";
import { OrderAddModal } from "./components/order-add-modal";

export default function OrdersPage() {
  const { t } = useTranslation();
  const { isDataEntry, loading: authLoading } = useCurrentUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [stickerCodes, setStickerCodes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ status: "PENDING", address: "" });
  const [addForm, setAddForm] = useState({
    userId: "",
    paymentType: "COD",
    status: "PENDING",
    address: "",
    items: [{ productId: "", quantity: 1 }],
  });

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      if (filterPayment === "ALL") return true;
      return o.paymentType?.toUpperCase() === filterPayment.toUpperCase();
    });
  }, [orders, filterPayment]);

  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(filteredOrders);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const url = `/api/orders?status=${filterStatus === "ALL" ? "" : filterStatus}&search=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error("Failed to load customer orders");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetaData = async () => {
    try {
      const [uRes, pRes] = await Promise.all([fetch("/api/users"), fetch("/api/products")]);
      if (uRes.ok && pRes.ok) {
        const uData = await uRes.json();
        const pData = await pRes.json();
        setUsers(uData);
        setProducts(pData);
        if (uData.length > 0) setAddForm((prev) => ({ ...prev, userId: uData[0].id, address: uData[0].address || "" }));
        if (pData.length > 0) setAddForm((prev) => ({ ...prev, items: [{ productId: pData[0].id, quantity: 1 }] }));
      }
    } catch {
      // Ignore metadata load errors
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, search]);

  useEffect(() => {
    loadMetaData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramOrderId = params.get("orderId");
      if (paramOrderId) {
        handleOpenDetail(paramOrderId);
      }
    }
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-semibold";
      case "SHIPPING":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 font-semibold";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-semibold";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
    }
  };

  const handleOpenDetail = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setIsDetailOpen(true);
      }
    } catch {
      toast.error("Failed to load order details");
    }
  };

  const handleOpenEdit = (order: any) => {
    setSelectedOrder(order);
    setEditForm({ status: order.status, address: order.address || "" });
    setIsEditOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        loadData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Error updating order status");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast.success("Order details updated successfully");
        setIsEditOpen(false);
        loadData();
        if (selectedOrder) {
          handleOpenDetail(selectedOrder.id);
        }
      } else {
        toast.error("Failed to update order details");
      }
    } catch {
      toast.error("Error saving order changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.userId || addForm.items.length === 0 || !addForm.address.trim()) {
      toast.error("Please fill in all required order fields");
      return;
    }
    setSaving(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Order created! Generated ${data.generatedCodesCount || 0} product barcodes.`);
        setIsAddOpen(false);
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create order");
      }
    } catch {
      toast.error("Error creating order");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintStickers = (factionCodes: any[]) => {
    if (!factionCodes || factionCodes.length === 0) {
      toast.warning("No barcodes generated for this order yet.");
      return;
    }
    setStickerCodes(factionCodes);
    setIsStickerOpen(true);
  };

  const renderSortHeader = (label: string, field: string) => {
    const isActive = sortConfig?.field === field;
    return (
      <div className="flex items-center gap-1.5 w-full">
        <span>{label}</span>
        <span className="flex-none rounded-md p-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
          {isActive ? (
            sortConfig.asc ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </div>
    );
  };

  if (isDataEntry) {
    return <AccessRestricted moduleName="Customer Orders & Fulfillment" />;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("customer_orders")}</h2>
          <p className="text-muted-foreground">{t("orders_description")}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> Add Order
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order ID, username..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("all_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("all_status")}</SelectItem>
            <SelectItem value="PENDING">{t("pending_orders")}</SelectItem>
            <SelectItem value="SHIPPING">{t("shipping_dispatched")}</SelectItem>
            <SelectItem value="DELIVERED">{t("delivered_completed")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("all_payments")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("all_payments")}</SelectItem>
            <SelectItem value="PAYPAL">{t("paypal")}</SelectItem>
            <SelectItem value="COD">{t("cash_on_delivery")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border border-border shadow-sm bg-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead onClick={() => requestSort("id")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Order ID", "id")}
                </TableHead>
                <TableHead onClick={() => requestSort("user.username")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Customer", "user.username")}
                </TableHead>
                <TableHead onClick={() => requestSort("totalAmount")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Total Amount", "totalAmount")}
                </TableHead>
                <TableHead onClick={() => requestSort("paymentType")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Payment Method", "paymentType")}
                </TableHead>
                <TableHead onClick={() => requestSort("status")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Status", "status")}
                </TableHead>
                <TableHead onClick={() => requestSort("createdAt")} className="group cursor-pointer select-none hover:bg-muted/80 transition-colors">
                  {renderSortHeader("Created At", "createdAt")}
                </TableHead>
                <TableHead className="w-28 text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoader colSpan={7} rows={5} columns={["code", "avatar", "number", "badge", "badge", "text", "actions"]} />
              ) : sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No orders recorded matching filter.
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground normal-case">#{o.id.substring(0, 8)}</TableCell>
                    <TableCell className="normal-case font-medium text-foreground">{o.user?.username || "Unknown"}</TableCell>
                    <TableCell className="font-bold normal-case text-foreground">{formatCurrency(o.totalAmount)}</TableCell>
                    <TableCell className="font-medium text-xs uppercase text-muted-foreground">{o.paymentType}</TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(val) => handleStatusChange(o.id, val)}>
                        <SelectTrigger className={`h-7 w-36 text-xs border ${getStatusBadgeClass(o.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">{t("pending")}</SelectItem>
                          <SelectItem value="SHIPPING">{t("shipping")}</SelectItem>
                          <SelectItem value="DELIVERED">{t("delivered")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="flex justify-end gap-1.5 py-3">
                      <Button size="icon" variant="outline" onClick={() => handlePrintStickers(o.factionCodes)} title="Print All Product Barcodes" className="cursor-pointer">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleOpenDetail(o.id)} title="View Details & Barcodes" className="cursor-pointer">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => handleOpenEdit(o)} title="Edit Order Details" className="cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subcomponent Modals */}
      <OrderDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onPrintStickers={handlePrintStickers}
        getStatusBadgeClass={getStatusBadgeClass}
      />

      <OrderEditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        order={selectedOrder}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        saving={saving}
      />

      <OrderAddModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        users={users}
        products={products}
        addForm={addForm}
        setAddForm={setAddForm}
        onSave={handleCreateOrder}
        saving={saving}
      />

      <StickerGeneratorModal
        open={isStickerOpen}
        onOpenChange={setIsStickerOpen}
        codes={stickerCodes}
        title="Order Barcode Sticker Sheet"
      />
    </div>
  );
}
