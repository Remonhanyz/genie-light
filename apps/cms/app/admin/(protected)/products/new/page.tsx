"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, Save, Sparkles, Layers, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { SubProductMatrix, SubProductItem } from "@/components/products/sub-product-matrix";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Parent Product State
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  // Child Variations State
  const [subProducts, setSubProducts] = useState<SubProductItem[]>([
    {
      sku: "GL-SERIES-15W-4000K-IP65-1",
      wattage: 15,
      luminousFlux: 1500,
      colorTemperature: 4000,
      cri: 80,
      beamAngle: "36°",
      ipRating: "IP65",
      inputVoltage: "220-240V",
      dimensions: "Ø85 x 65mm",
      price: 350,
      discountPrice: "",
      stockQuantity: 50,
      datasheetUrl: "",
      active: true,
    },
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);

        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
          if (catsData.length > 0) setCategoryId(catsData[0].id);
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData);
          if (brandsData.length > 0) setBrandId(brandsData[0].id);
        }
      } catch {
        toast.error("Failed to load lighting categories or partner brands");
      }
    };
    loadInitialData();
  }, []);

  const selectedBrand = brands.find((b) => b.id === brandId);
  const brandCode = selectedBrand ? selectedBrand.name.slice(0, 4) : "GL";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product commercial name.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a lighting category.");
      return;
    }

    if (!brandId) {
      toast.error("Please select a partner brand.");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a product description.");
      return;
    }

    if (subProducts.length === 0) {
      toast.error("At least one child variation is required.");
      return;
    }

    for (let i = 0; i < subProducts.length; i++) {
      const sp = subProducts[i];
      if (!sp.price || Number(sp.price) <= 0) {
        toast.error(`Variation #${i + 1} (${sp.sku || "Variant"}) must have a valid price.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        brandId,
        categoryId,
        shortDesc: shortDesc.trim() || undefined,
        description,
        featured,
        active,
        images,
        subProducts,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Parent product "${name}" and ${subProducts.length} variations published successfully!`);
        router.push("/admin/products");
      } else {
        toast.error(data.error || "Failed to create product");
      }
    } catch {
      toast.error("An unexpected network error occurred while publishing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 w-full max-w-[1600px] mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/products")}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Button>
          <div className="h-4 w-[1px] bg-border" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Create Parent Product & Variant Matrix
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Publish Product
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Parent Info & Photometric Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Parent Product Details
              </CardTitle>
              <CardDescription className="text-xs">
                Commercial series branding, taxonomy hierarchy, and general description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Commercial Product Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Venice Architectural Recessed Downlight Series"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Partner Brand <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Category Hierarchy <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortDesc" className="text-xs font-semibold">
                  Short Technical Summary / Subtitle
                </Label>
                <Input
                  id="shortDesc"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="e.g. Precision optical reflector with anti-glare UGR < 19"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Comprehensive Description <span className="text-rose-500">*</span>
                </Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe lighting performance, optical design, thermal heatsink, driver specs, and architectural applications..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Media & Publishing Controls */}
        <div className="space-y-6">
          {/* Images Upload Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Product Gallery</CardTitle>
              <CardDescription className="text-xs">
                Upload primary luminaire renders and technical dimension diagrams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={images}
                onChange={setImages}
                disabled={loading}
                maxFiles={8}
              />
            </CardContent>
          </Card>

          {/* Visibility & Badges Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Publishing Status</CardTitle>
              <CardDescription className="text-xs">
                Catalog visibility and promotional flags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={active}
                  onCheckedChange={(checked) => setActive(!!checked)}
                />
                <label
                  htmlFor="active"
                  className="text-xs font-medium leading-none cursor-pointer"
                >
                  Active in Live Storefront
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={featured}
                  onCheckedChange={(checked) => setFeatured(!!checked)}
                />
                <label
                  htmlFor="featured"
                  className="text-xs font-medium leading-none cursor-pointer"
                >
                  Feature in B2B Project Showcase
                </label>
              </div>

              <div className="pt-3 border-t text-[11px] text-muted-foreground flex items-start gap-2 bg-muted/20 p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  All created child variations will be linked to your user account for catalog audit tracking.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-Width Section: Dynamic Child Variation Matrix */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Dynamic Child Variation Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Define the matrix of photometric models (Wattage, CCT, Lumens, Beam, IP) and attach manufacturer PDF datasheets across all SKUs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubProductMatrix
            items={subProducts}
            onChange={setSubProducts}
            brandCode={brandCode}
            productSeries={name}
          />
        </CardContent>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t bg-card/80 backdrop-blur-xs p-4 rounded-xl border shadow-xs">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-sm px-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Publish Product
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
