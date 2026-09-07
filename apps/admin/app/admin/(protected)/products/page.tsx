"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
  Layers,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface SubProduct {
  id: string;
  sku: string;
  modelNumber: string | null;
  wattage: number | null;
  luminousFlux: number | null;
  colorTemperature: number | null;
  cri: number | null;
  beamAngle: string | null;
  ipRating: string | null;
  price: number | string;
  discountPrice: number | string | null;
  stockQuantity: number;
  datasheetUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  featured: boolean;
  active: boolean;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  images: { id: string; url: string }[];
  subProducts: SubProduct[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, brandsRes, catsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/brands"),
        fetch("/api/categories"),
      ]);

      if (prodsRes.ok) {
        const data = await prodsRes.json();
        setProducts(data);
      }
      if (brandsRes.ok) {
        const bData = await brandsRes.json();
        setBrands(bData);
      }
      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(cData);
      }
    } catch {
      toast.error("Failed to load catalog products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate/delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}?force=true`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Product "${name}" deleted`);
        fetchData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch {
      toast.error("Error deleting product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.subProducts?.some((sp) => sp.sku.toLowerCase().includes(q));

    const matchesBrand = !selectedBrand || p.brand?.id === selectedBrand;
    const matchesCategory = !selectedCategory || p.category?.id === selectedCategory;

    return matchesSearch && matchesBrand && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedProductId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Luminaires & Technical Catalog
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage parent fixture families and child photometric variation matrices (W, lm, CCT, IP, datasheets).
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add New Luminaire
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="border bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by luminaire name, family, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background w-full"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Product List Table */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          Loading luminaire families...
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="border p-12 text-center text-muted-foreground bg-card">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-base font-semibold">No luminaires found</p>
          <p className="text-sm mt-1">Try clearing your filters or create a new luminaire family.</p>
        </Card>
      ) : (
        <Card className="border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3.5 w-10"></th>
                  <th className="px-4 py-3.5">Luminaire Family</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Child Variations</th>
                  <th className="px-4 py-3.5">Wattage Span</th>
                  <th className="px-4 py-3.5">Price Range</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const variants = product.subProducts || [];
                  const wattages = variants.map((v) => v.wattage).filter((w): w is number => w !== null);
                  const minW = wattages.length ? Math.min(...wattages) : null;
                  const maxW = wattages.length ? Math.max(...wattages) : null;

                  const prices = variants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
                  const minP = prices.length ? Math.min(...prices) : null;
                  const maxP = prices.length ? Math.max(...prices) : null;

                  const isExpanded = expandedProductId === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleExpand(product.id)}
                            className="p-1 rounded hover:bg-muted text-muted-foreground"
                            title="Toggle child variants"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Lightbulb className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                {product.name}
                                {product.featured && (
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <span className="text-xs font-mono text-muted-foreground">
                                {product.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-xs font-medium">
                            {product.brand?.name || "Official"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {product.category?.name || "General"}
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary font-bold text-xs gap-1"
                          >
                            <Layers className="h-3 w-3" />
                            {variants.length} Variants
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-xs font-mono text-muted-foreground">
                          {minW !== null && maxW !== null
                            ? minW === maxW
                              ? `${minW}W`
                              : `${minW}W - ${maxW}W`
                            : "—"}
                        </td>
                        <td className="px-4 py-4 font-bold text-foreground text-xs">
                          {minP !== null
                            ? minP === maxP
                              ? `${minP.toFixed(2)} EGP`
                              : `${minP.toFixed(2)} - ${maxP?.toFixed(2)} EGP`
                            : "—"}
                        </td>
                        <td className="px-4 py-4">
                          {product.active ? (
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/20 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-500 bg-zinc-500/10 border-zinc-500/20 text-xs">
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                                <Edit2 className="h-3.5 w-3.5" /> Edit
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(product.id, product.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Product Variation Matrix */}
                      {isExpanded && (
                        <tr className="bg-muted/15">
                          <td colSpan={9} className="p-4 pl-14">
                            <div className="rounded-lg border bg-background p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <Layers className="h-3.5 w-3.5 text-primary" />
                                  Child Variation Matrix ({variants.length} SKUs)
                                </h4>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                    Manage Matrix
                                  </Button>
                                </Link>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-muted/40 text-muted-foreground">
                                    <tr>
                                      <th className="p-2">SKU Code</th>
                                      <th className="p-2">Power</th>
                                      <th className="p-2">Luminous Flux</th>
                                      <th className="p-2">CCT</th>
                                      <th className="p-2">Beam & IP</th>
                                      <th className="p-2">Price (EGP)</th>
                                      <th className="p-2">Stock</th>
                                      <th className="p-2 text-right">PDF Datasheet</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {variants.map((v) => (
                                      <tr key={v.id} className="hover:bg-muted/20">
                                        <td className="p-2 font-mono font-semibold text-foreground">
                                          {v.sku}
                                        </td>
                                        <td className="p-2 font-mono">
                                          {v.wattage ? `${v.wattage}W` : "—"}
                                        </td>
                                        <td className="p-2 font-mono">
                                          {v.luminousFlux ? `${v.luminousFlux} lm` : "—"}
                                        </td>
                                        <td className="p-2">
                                          {v.colorTemperature ? (
                                            <span className="flex items-center gap-1">
                                              <span
                                                className="h-2.5 w-2.5 rounded-full inline-block"
                                                style={{
                                                  backgroundColor:
                                                    v.colorTemperature <= 3000
                                                      ? "#F59E0B"
                                                      : v.colorTemperature <= 4500
                                                      ? "#F3F4F6"
                                                      : "#38BDF8",
                                                  border: "1px solid #D1D5DB",
                                                }}
                                              />
                                              {v.colorTemperature}K
                                            </span>
                                          ) : (
                                            "—"
                                          )}
                                        </td>
                                        <td className="p-2 text-muted-foreground">
                                          {v.beamAngle || "110°"} • {v.ipRating || "IP65"}
                                        </td>
                                        <td className="p-2 font-bold text-foreground">
                                          {Number(v.price).toFixed(2)}
                                          {v.discountPrice && (
                                            <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                                              {Number(v.discountPrice).toFixed(2)}
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-2">
                                          <span className={v.stockQuantity > 0 ? "text-emerald-600" : "text-destructive font-bold"}>
                                            {v.stockQuantity} units
                                          </span>
                                        </td>
                                        <td className="p-2 text-right">
                                          {v.datasheetUrl ? (
                                            <a
                                              href={v.datasheetUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-primary hover:underline"
                                            >
                                              <FileText className="h-3.5 w-3.5" /> PDF
                                            </a>
                                          ) : (
                                            <span className="text-amber-500 font-medium text-[11px]">
                                              No Spec Sheet
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
