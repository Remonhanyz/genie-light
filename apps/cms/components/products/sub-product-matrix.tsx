"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutoExpandInput } from "@/components/ui/auto-expand-input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Copy,
  Sparkles,
  FileText,
  AlertTriangle,
  Upload,
  ExternalLink,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export interface SubProductItem {
  id?: string;
  sku: string;
  modelNumber?: string;
  wattage?: number | string;
  luminousFlux?: number | string;
  colorTemperature?: number | string;
  cri?: number | string;
  beamAngle?: string;
  ipRating?: string;
  inputVoltage?: string;
  dimensions?: string;
  otherDetails?: string;
  price: number | string;
  discountPrice?: number | string;
  stockQuantity: number | string;
  datasheetUrl?: string;
  active?: boolean;
}

interface SubProductMatrixProps {
  items: SubProductItem[];
  onChange: (items: SubProductItem[]) => void;
  brandCode?: string;
  productSeries?: string;
}

const CCT_OPTIONS = [
  { value: 3000, label: "3000K (Warm White)", color: "#F59E0B" },
  { value: 4000, label: "4000K (Neutral White)", color: "#FEF3C7" },
  { value: 6500, label: "6500K (Cool Daylight)", color: "#E0F2FE" },
];

const IP_OPTIONS = ["IP20", "IP44", "IP54", "IP65", "IP66", "IP67", "IP68"];
const BEAM_OPTIONS = ["15°", "24°", "36°", "45°", "60°", "90°", "120°", "140°"];

export function SubProductMatrix({
  items,
  onChange,
  brandCode = "GL",
  productSeries = "LUM",
}: SubProductMatrixProps) {
  // Datasheet modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);
  const [manualPdfUrl, setManualPdfUrl] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const getCleanSeriesCode = () => {
    return (
      productSeries
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6) || "SERIES"
    );
  };

  const getCleanBrandCode = () => {
    return (
      brandCode
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4) || "GL"
    );
  };

  const generateSingleSku = (item: SubProductItem, index: number) => {
    const brand = getCleanBrandCode();
    const series = getCleanSeriesCode();
    const w = item.wattage ? `${item.wattage}W` : "0W";
    const k = item.colorTemperature ? `${item.colorTemperature}K` : "4000K";
    const ip = item.ipRating || "IP65";
    return `${brand}-${series}-${w}-${k}-${ip}-${index + 1}`;
  };

  const handleGenerateAllSkus = () => {
    const updated = items.map((item, idx) => ({
      ...item,
      sku: generateSingleSku(item, idx),
    }));
    onChange(updated);
    toast.success("Standard photometric SKUs generated for all variations!");
  };

  const handleAddVariant = () => {
    const defaultWattage = items.length > 0 ? items[items.length - 1].wattage : 15;
    const defaultPrice = items.length > 0 ? items[items.length - 1].price : 350;
    const newIndex = items.length;

    const newItem: SubProductItem = {
      sku: "",
      wattage: defaultWattage,
      luminousFlux: Number(defaultWattage) * 100,
      colorTemperature: 4000,
      cri: 80,
      beamAngle: "36°",
      ipRating: "IP65",
      inputVoltage: "220-240V",
      dimensions: "",
      price: defaultPrice,
      discountPrice: "",
      stockQuantity: 50,
      datasheetUrl: "",
      active: true,
    };

    newItem.sku = generateSingleSku(newItem, newIndex);
    onChange([...items, newItem]);
  };

  const handleDuplicateVariant = (index: number) => {
    const source = items[index];
    const duplicate: SubProductItem = {
      ...source,
      id: undefined, // ensure new record
      sku: generateSingleSku(source, items.length),
    };
    onChange([...items, duplicate]);
    toast.success("Variation duplicated!");
  };

  const handleRemoveVariant = (index: number) => {
    if (items.length <= 1) {
      toast.error("At least one child variation is required per product.");
      return;
    }
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleFieldChange = (index: number, field: keyof SubProductItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Auto-calculate lumens if wattage changes and lumens is default
    if (field === "wattage" && value && !isNaN(Number(value))) {
      const w = Number(value);
      if (!updated[index].luminousFlux || updated[index].luminousFlux === 0) {
        updated[index].luminousFlux = w * 100;
      }
    }

    onChange(updated);
  };

  const openDatasheetModal = (index: number) => {
    setActiveVariantIndex(index);
    setManualPdfUrl(items[index]?.datasheetUrl || "");
    setModalOpen(true);
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeVariantIndex === null) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Datasheet must be a PDF document.");
      return;
    }

    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/datasheets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        handleFieldChange(activeVariantIndex, "datasheetUrl", data.url);
        toast.success(`Attached datasheet: ${file.name}`);
        setModalOpen(false);
      } else {
        toast.error(data.error || "Failed to upload datasheet");
      }
    } catch {
      toast.error("Network error during datasheet upload");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSaveManualPdf = () => {
    if (activeVariantIndex === null) return;
    handleFieldChange(activeVariantIndex, "datasheetUrl", manualPdfUrl.trim());
    setModalOpen(false);
    toast.success("Datasheet URL updated");
  };

  const handleRemovePdf = (index: number) => {
    handleFieldChange(index, "datasheetUrl", "");
    toast.info("Datasheet link removed");
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-4 rounded-xl border">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            Child Variation Matrix ({items.length} {items.length === 1 ? "Variant" : "Variants"})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Photometric specs (Wattage, CCT, Lumens, IP Rating, Beam) and commercial pricing per SKU.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateAllSkus}
            className="text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Generate All SKUs
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAddVariant}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Variation Row
          </Button>
        </div>
      </div>

      {/* Variation Table */}
      <div className="overflow-x-auto border rounded-xl shadow-sm bg-card">
        <table className="w-max min-w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <th className="p-2.5 whitespace-nowrap min-w-[160px]">SKU / Model</th>
              <th className="p-2.5 whitespace-nowrap min-w-[75px]">Wattage (W)</th>
              <th className="p-2.5 whitespace-nowrap min-w-[80px]">Flux (lm)</th>
              <th className="p-2.5 whitespace-nowrap min-w-[95px]">CCT (Kelvin)</th>
              <th className="p-2.5 whitespace-nowrap min-w-[65px]">CRI</th>
              <th className="p-2.5 whitespace-nowrap min-w-[70px]">Beam</th>
              <th className="p-2.5 whitespace-nowrap min-w-[75px]">IP Rating</th>
              <th className="p-2.5 whitespace-nowrap min-w-[85px]">Price (EGP)</th>
              <th className="p-2.5 whitespace-nowrap min-w-[85px]">Sale Price</th>
              <th className="p-2.5 whitespace-nowrap min-w-[70px]">Stock</th>
              <th className="p-2.5 whitespace-nowrap min-w-[110px]">Datasheet PDF</th>
              <th className="p-2.5 whitespace-nowrap text-center min-w-[65px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, idx) => {
              const hasPdf = Boolean(item.datasheetUrl && item.datasheetUrl.trim().length > 0);

              return (
                <tr
                  key={item.id || idx}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* SKU */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <div className="space-y-1 flex flex-col items-start">
                      <AutoExpandInput
                        value={item.sku}
                        onChange={(e) => handleFieldChange(idx, "sku", e.target.value)}
                        placeholder="e.g. PHI-VEN-15W-3K-IP65"
                        minChars={16}
                        maxChars={50}
                        className="font-mono font-medium"
                      />
                      <AutoExpandInput
                        value={item.modelNumber || ""}
                        onChange={(e) => handleFieldChange(idx, "modelNumber", e.target.value)}
                        placeholder="Opt. Model #"
                        minChars={12}
                        maxChars={50}
                        className="h-6 text-[10px] text-muted-foreground"
                      />
                    </div>
                  </td>

                  {/* Wattage */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.wattage ?? ""}
                      onChange={(e) => handleFieldChange(idx, "wattage", e.target.value)}
                      placeholder="15"
                      minChars={6}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* Flux */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.luminousFlux ?? ""}
                      onChange={(e) => handleFieldChange(idx, "luminousFlux", e.target.value)}
                      placeholder="1500"
                      minChars={7}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* CCT (Kelvin) */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.colorTemperature ?? ""}
                      onChange={(e) => handleFieldChange(idx, "colorTemperature", e.target.value)}
                      placeholder="3000K"
                      minChars={8}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* CRI */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.cri ?? ""}
                      onChange={(e) => handleFieldChange(idx, "cri", e.target.value)}
                      placeholder="80"
                      minChars={5}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* Beam Angle */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.beamAngle || ""}
                      onChange={(e) => handleFieldChange(idx, "beamAngle", e.target.value)}
                      placeholder="36°"
                      minChars={6}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* IP Rating */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.ipRating || ""}
                      onChange={(e) => handleFieldChange(idx, "ipRating", e.target.value)}
                      placeholder="IP65"
                      minChars={6}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* Price */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.price ?? ""}
                      onChange={(e) => handleFieldChange(idx, "price", e.target.value)}
                      placeholder="350"
                      minChars={7}
                      maxChars={50}
                      className="font-semibold text-foreground"
                    />
                  </td>

                  {/* Sale Price */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.discountPrice ?? ""}
                      onChange={(e) => handleFieldChange(idx, "discountPrice", e.target.value)}
                      placeholder="Opt. Sale"
                      minChars={7}
                      maxChars={50}
                      className="text-muted-foreground"
                    />
                  </td>

                  {/* Stock */}
                  <td className="p-2.5 align-middle whitespace-nowrap">
                    <AutoExpandInput
                      value={item.stockQuantity ?? ""}
                      onChange={(e) => handleFieldChange(idx, "stockQuantity", e.target.value)}
                      placeholder="50"
                      minChars={5}
                      maxChars={50}
                      className="font-medium"
                    />
                  </td>

                  {/* Technical Datasheet PDF attachment */}
                  <td className="p-2.5 align-middle">
                    {hasPdf ? (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span
                          className="truncate max-w-[80px] text-[10px] font-medium"
                          title={item.datasheetUrl}
                        >
                          PDF Linked
                        </span>
                        <a
                          href={item.datasheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(idx)}
                          className="text-muted-foreground hover:text-rose-500 ml-auto"
                          title="Remove PDF"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openDatasheetModal(idx)}
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors w-full justify-center"
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                        <span>No PDF linked</span>
                      </button>
                    )}
                  </td>

                  {/* Row Actions */}
                  <td className="p-2.5 align-middle text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDuplicateVariant(idx)}
                        title="Duplicate Variant"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => handleRemoveVariant(idx)}
                        title="Delete Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Datasheet Upload & Link Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Attach Technical Datasheet PDF
            </DialogTitle>
            <DialogDescription>
              Upload a manufacturer PDF datasheet or paste an external URL for variation{" "}
              <span className="font-mono font-medium text-foreground">
                {activeVariantIndex !== null ? items[activeVariantIndex]?.sku || `#${activeVariantIndex + 1}` : ""}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Upload Option */}
            <div className="border-2 border-dashed rounded-xl p-5 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleUploadPdf}
                disabled={uploadingPdf}
              />
              <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-medium text-foreground mb-1">
                Upload Technical PDF to MinIO Storage
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Max 25MB · Spec sheets, photometric test reports, or CAD curves
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadingPdf}
                onClick={() => pdfInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                {uploadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Choose PDF File
                  </>
                )}
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <span className="border-t w-full border-border" />
              <span className="bg-background px-2 text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                OR PASTE DIRECT URL
              </span>
              <span className="border-t w-full border-border" />
            </div>

            {/* Direct Link Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Public Datasheet URL</label>
              <Input
                value={manualPdfUrl}
                onChange={(e) => setManualPdfUrl(e.target.value)}
                placeholder="https://storage.example.com/datasheets/venice-15w.pdf"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveManualPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
