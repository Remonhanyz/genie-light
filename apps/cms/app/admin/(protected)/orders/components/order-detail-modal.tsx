"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, PackageCheck } from "lucide-react";
import { Barcode, triggerBarcodeDownload } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n-client";

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onPrintStickers: (barcodes: any[]) => void;
  getStatusBadgeClass: (status: string) => string;
}

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
  onStatusChange,
  onPrintStickers,
  getStatusBadgeClass,
}: OrderDetailModalProps) {
  const { t } = useTranslation();

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Order Detail Ledger
            </DialogTitle>
            <span className="text-xs font-mono text-muted-foreground">ID: {order.id}</span>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 border-b pb-4 text-sm">
            <div>
              <h4 className="font-semibold text-muted-foreground">{t("customer_profile")}</h4>
              <p className="mt-1 font-medium text-foreground">{order.user?.username}</p>
              <p className="text-muted-foreground">{order.user?.email}</p>
              <p className="text-muted-foreground">{order.user?.phone}</p>
            </div>
            <div>
              <h4 className="font-semibold text-muted-foreground">{t("shipping_details")}</h4>
              <p className="mt-1 text-foreground leading-relaxed">{order.address}</p>
              <p className="mt-2 font-semibold">
                {t("payment_label")}{" "}
                <span className="uppercase text-xs font-bold text-primary">{order.paymentType}</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{t("items_ordered")}</h4>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="h-8 py-1 text-xs">{t("product")}</TableHead>
                    <TableHead className="h-8 py-1 text-xs text-center">{t("qty")}</TableHead>
                    <TableHead className="h-8 py-1 text-xs text-right">{t("price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2 font-medium text-foreground">{item.product?.name}</TableCell>
                      <TableCell className="py-2 text-center text-foreground">{item.quantity}</TableCell>
                      <TableCell className="py-2 text-right text-foreground font-semibold">
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {((order.barcodes && order.barcodes.length > 0) || (order.items && order.items.length > 0)) && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1.5">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  Generated Product Barcodes ({order.barcodes?.length || order.items?.length || 0})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPrintStickers(order.barcodes || order.items?.map((i: any) => ({ code: i.sku, product: { name: i.productName } })) || [])}
                  className="gap-1.5 h-7 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Sticker Sheet
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(order.barcodes || order.items?.map((i: any) => ({ id: i.id, code: i.sku, product: { name: i.productName } })) || []).map((fc: any) => (
                  <div key={fc.id || fc.code} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card shadow-xs">
                    <div>
                      <div className="font-mono text-sm font-bold tracking-wider uppercase text-foreground">{fc.code}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{fc.product?.name || "Product Item"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Barcode value={fc.code} width={1.2} height={30} displayValue={false} className="border-none p-0 bg-transparent" />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 cursor-pointer"
                        onClick={() => triggerBarcodeDownload(fc.code)}
                        title="Download Barcode SVG"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t("status_label")}</span>
              <Select value={order.status} onValueChange={(val) => onStatusChange(order.id, val)}>
                <SelectTrigger className={`h-8 w-36 text-xs border ${getStatusBadgeClass(order.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">{t("pending")}</SelectItem>
                  <SelectItem value="SHIPPING">{t("shipping")}</SelectItem>
                  <SelectItem value="DELIVERED">{t("delivered")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">{t("total_summary")}</span>
              <div className="text-xl font-extrabold text-foreground">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
