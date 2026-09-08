"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Barcode } from "@/components/ui/barcode";
import { Printer, Download } from "lucide-react";
import { toast } from "sonner";

interface StickerGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: Array<{ id?: string; code: string; product?: { name: string } }>;
  title?: string;
}

export function StickerGeneratorModal({
  open,
  onOpenChange,
  codes,
  title = "Barcode Sticker Sheet Generator",
}: StickerGeneratorModalProps) {
  const handlePrint = () => {
    if (!codes || codes.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup window blocked! Please allow popups for this site to print sticker labels.");
      return;
    }

    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
            body {
              font-family: monospace;
              padding: 20px;
              background: #fff;
              color: #000;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .card {
              border: 1px dashed #bbb;
              padding: 8px 4px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #fff;
              page-break-inside: avoid;
            }
            .title {
              font-size: 8px;
              font-weight: bold;
              text-transform: uppercase;
              color: #555;
            }
            .product-text {
              font-size: 8px;
              color: #666;
              margin-top: 2px;
              max-width: 150px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .btn-container {
              text-align: center;
              padding: 10px;
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .btn {
              background: #18181b;
              color: #fff;
              border: none;
              padding: 8px 16px;
              font-family: sans-serif;
              font-size: 14px;
              font-weight: bold;
              border-radius: 4px;
              cursor: pointer;
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <div class="no-print btn-container">
            <button class="btn" onclick="window.print()">Print Label Sticker Sheet</button>
          </div>
          <div class="grid">
    `;

    codes.forEach((c) => {
      html += `
        <div class="card">
          <div class="title">GENIE LIGHT EGYPT</div>
          <svg id="barcode-${c.code}"></svg>
          <div class="product-text">${c.product?.name || "Lighting Fixture"}</div>
        </div>
      `;
    });

    html += `
          </div>
          <script>
            window.onload = function() {
    `;

    codes.forEach((c) => {
      html += `
              try {
                JsBarcode("#barcode-${c.code}", "${c.code}", {
                  format: "CODE128",
                  width: 1.25,
                  height: 40,
                  displayValue: true,
                  fontSize: 18,
                  textMargin: 5,
                  font: "monospace",
                  fontOptions: "bold",
                  margin: 2
                });
              } catch(e) {
                console.error(e);
              }
      `;
    });

    html += `
              setTimeout(() => { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Printer className="h-5 w-5 text-primary" />
              {title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live preview of generated 4-column sticker sheet ({codes.length} labels).
            </p>
          </div>
        </DialogHeader>

        {codes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No barcode items selected for sticker generation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 max-h-[55vh] overflow-y-auto pr-1">
            {codes.map((c, i) => (
              <div
                key={c.id || i}
                className="border border-dashed border-default-300 dark:border-default-700 p-3 rounded-lg flex flex-col items-center justify-center bg-white text-black shadow-xs text-center"
              >
                <div className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider mb-1">
                  GENIE LIGHT EGYPT
                </div>
                <Barcode
                  value={c.code}
                  width={1.25}
                  height={36}
                  displayValue={true}
                  fontSize={16}
                  className="border-none p-0 bg-transparent"
                />
                <div className="text-[10px] text-zinc-600 truncate max-w-[150px] font-semibold mt-1">
                  {c.product?.name || "Lighting Fixture"}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="pt-3 border-t flex flex-row justify-between items-center">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            disabled={codes.length === 0}
            className="gap-2 cursor-pointer font-bold"
          >
            <Printer className="h-4 w-4" /> Print Sticker Sheet ({codes.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
