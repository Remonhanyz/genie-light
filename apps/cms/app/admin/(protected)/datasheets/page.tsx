"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function DatasheetsPage() {
  const [datasheets, setDatasheets] = useState<any[]>([]);
  const [missingCount, setMissingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasheets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/datasheets");
      if (res.ok) {
        const data = await res.json();
        setDatasheets(data.datasheets || []);
        setMissingCount(data.missingDatasheetsCount || 0);
      }
    } catch {
      toast.error("Failed to load technical datasheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasheets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are permitted for technical spec datasheets.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/datasheets/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Datasheet "${file.name}" uploaded successfully!`);
        fetchDatasheets();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to upload datasheet");
      }
    } catch {
      toast.error("An error occurred during file upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Datasheet URL copied to clipboard!");
  };

  const filteredDatasheets = datasheets.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.sku?.toLowerCase().includes(query) ||
      item.product?.name?.toLowerCase().includes(query) ||
      item.product?.brand?.name?.toLowerCase().includes(query) ||
      item.datasheetUrl?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Technical Datasheet Repository
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store and bind official manufacturer PDF photometric datasheets to sub-product SKU variations.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 shrink-0"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload PDF Datasheet
          </Button>
        </div>
      </div>

      {/* Warning Banner if variants lack datasheets (Section 3.4.C.2) */}
      {missingCount > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-sm">
                  Technical Datasheet Verification Warning
                </div>
                <div className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  There are currently <strong>{missingCount}</strong> active child variations in the catalog without an attached technical PDF datasheet.
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs shrink-0">
              {missingCount} Missing Specs
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Drag & Drop Upload Card */}
      <Card
        onClick={() => fileInputRef.current?.click()}
        className="border-dashed border-2 hover:border-primary/60 transition-colors cursor-pointer bg-card/60 p-8 text-center"
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="p-3 bg-primary/10 rounded-full text-primary mb-3">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">
            Drop new PDF datasheet here or browse files
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Accepts official specification sheets (.pdf) up to 25MB. Files are permanently stored in MinIO object storage.
          </p>
        </div>
      </Card>

      {/* Search Filter */}
      <Card className="border bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasheets by SKU, luminaire family, brand, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong>{filteredDatasheets.length}</strong> linked datasheets
          </div>
        </CardContent>
      </Card>

      {/* Datasheets Table */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          Loading technical datasheets...
        </div>
      ) : filteredDatasheets.length === 0 ? (
        <Card className="border p-12 text-center text-muted-foreground bg-card">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-base font-semibold">No datasheets matching your search</p>
          <p className="text-sm mt-1">Upload a PDF datasheet above or link one to a product variant.</p>
        </Card>
      ) : (
        <Card className="border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3.5">Sub-Product SKU</th>
                  <th className="px-6 py-3.5">Luminaire Family</th>
                  <th className="px-6 py-3.5">Brand</th>
                  <th className="px-6 py-3.5">Specs Summary</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDatasheets.map((sp) => (
                  <tr key={sp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground">
                      {sp.sku}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {sp.product?.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs font-normal">
                        {sp.product?.brand?.name || "Official"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {[
                        sp.wattage ? `${sp.wattage}W` : null,
                        sp.colorTemperature ? `${sp.colorTemperature}K` : null,
                        sp.luminousFlux ? `${sp.luminousFlux}lm` : null,
                        sp.ipRating,
                      ]
                        .filter(Boolean)
                        .join(" | ") || "Standard"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs gap-1"
                          onClick={() => copyToClipboard(sp.datasheetUrl)}
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy URL
                        </Button>
                        <a
                          href={sp.datasheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
