"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface BatchProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportStats {
  totalRows: number;
  productsCreated: number;
  productsUpdated: number;
  subProductsCreated: number;
  subProductsUpdated: number;
}

export function BatchProductsModal({
  open,
  onOpenChange,
  onSuccess,
}: BatchProductsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setStats(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (
        !selected.name.endsWith(".xlsx") &&
        !selected.name.endsWith(".xls") &&
        !selected.name.endsWith(".csv")
      ) {
        toast.error("Please select a valid Excel file (.xlsx, .xls) or CSV.");
        return;
      }
      setFile(selected);
      setStats(null);
      setErrors([]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (
        !dropped.name.endsWith(".xlsx") &&
        !dropped.name.endsWith(".xls") &&
        !dropped.name.endsWith(".csv")
      ) {
        toast.error("Please upload a valid Excel spreadsheet (.xlsx, .xls).");
        return;
      }
      setFile(dropped);
      setStats(null);
      setErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file first.");
      return;
    }

    setIsUploading(true);
    setStats(null);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/batch-import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Batch import failed");
        if (data.errors && data.errors.length > 0) {
          setErrors(data.errors);
        }
        return;
      }

      setStats(data.stats);
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }

      toast.success(
        `Import complete! Processed ${data.stats.totalRows} variation row(s).`
      );
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload and process Excel file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          handleReset();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Batch Import Luminaires & Variations
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload an Excel workbook (.xlsx) containing parent products and child photometric variations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Download Template Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Download Official Excel Template
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pre-formatted with lighting columns, photometric specs, and sample rows.
              </p>
            </div>
            <a href="/api/products/template" download>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Template (.xlsx)
              </Button>
            </a>
          </div>

          {/* File Upload Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Click to select or drag & drop Excel workbook
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Results Card */}
          {stats && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Import Processed Successfully
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-background border">
                  <div className="text-lg font-bold text-emerald-600">{stats.productsCreated}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Products Created
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-background border">
                  <div className="text-lg font-bold text-blue-600">{stats.productsUpdated}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Products Updated
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-background border">
                  <div className="text-lg font-bold text-indigo-600">{stats.subProductsCreated}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Sub-SKUs Created
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-background border">
                  <div className="text-lg font-bold text-violet-600">{stats.subProductsUpdated}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Sub-SKUs Updated
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Errors / Warnings */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1.5 max-h-36 overflow-y-auto">
              <div className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Processing Warnings & Errors
              </div>
              <ul className="text-[11px] text-destructive space-y-1 pl-4 list-disc">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="cursor-pointer"
          >
            {stats ? "Close" : "Cancel"}
          </Button>

          <div className="flex items-center gap-2">
            {file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUploading}
                className="cursor-pointer text-xs"
              >
                Clear
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              disabled={!file || isUploading}
              onClick={handleUpload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Importing Excel Rows...
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  Import Into Catalog
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
