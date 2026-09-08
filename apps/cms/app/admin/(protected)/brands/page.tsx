"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  isOfficial: boolean;
  _count?: { products: number };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    description: "",
    isOfficial: true,
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch {
      toast.error("Failed to load partner brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateDialog = () => {
    setEditingBrand(null);
    setForm({
      name: "",
      logoUrl: "",
      description: "",
      isOfficial: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (b: Brand) => {
    setEditingBrand(b);
    setForm({
      name: b.name,
      logoUrl: b.logoUrl || "",
      description: b.description || "",
      isOfficial: b.isOfficial,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setSaving(true);
      if (editingBrand) {
        const res = await fetch(`/api/brands/${editingBrand.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("Brand updated successfully");
          setDialogOpen(false);
          fetchBrands();
        } else {
          toast.error("Failed to update brand");
        }
      } else {
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success("Brand created successfully");
          setDialogOpen(false);
          fetchBrands();
        } else {
          toast.error("Failed to create brand");
        }
      }
    } catch {
      toast.error("An error occurred while saving brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Brand ${name} deleted`);
        fetchBrands();
      } else {
        toast.error("Failed to delete brand");
      }
    } catch {
      toast.error("Error deleting brand");
    }
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Partner Brands Portfolio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage official agent status, manufacturer profiles, and luminaire families.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Partner Brand
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partner brands by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong>{filteredBrands.length}</strong> of {brands.length} brands
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          Loading partner brands...
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card className="border p-12 text-center text-muted-foreground bg-card">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-base font-semibold">No partner brands found</p>
          <p className="text-sm mt-1">Try adjusting your search query or add a new brand.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="border hover:border-primary/50 transition-all shadow-xs bg-card flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {brand.logoUrl ? (
                      <div className="relative w-11 h-11 rounded-lg border border-border bg-white dark:bg-zinc-900 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-1.5">
                        {brand.name}
                      </CardTitle>
                      <span className="text-xs font-mono text-muted-foreground">{brand.slug}</span>
                    </div>
                  </div>
                  {brand.isOfficial && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Official
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {brand.description || "Official partner supplier of specialized architectural and commercial electrical fixtures."}
                </p>

                <div className="pt-2 border-t flex items-center justify-between">
                  <div className="text-xs font-medium text-foreground">
                    <span className="text-primary font-bold text-sm">
                      {brand._count?.products ?? 0}
                    </span>{" "}
                    Luminaires
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(brand)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(brand.id, brand.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Partner Brand"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Brand Name *</Label>
              <Input
                id="brand-name"
                placeholder="e.g. Philips, Schneider Electric, OSRAM"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Brand Logo / Manufacturer Identity</Label>
              <ImageUpload
                value={form.logoUrl ? [form.logoUrl] : []}
                onChange={(urls) => setForm({ ...form, logoUrl: urls[0] || "" })}
                disabled={saving}
                maxFiles={1}
              />
              {form.logoUrl && (
                <p className="text-[11px] text-muted-foreground truncate max-w-full font-mono mt-1">
                  {form.logoUrl}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand-desc">Description</Label>
              <textarea
                id="brand-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Overview of commercial lighting specialization and product range..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-official"
                checked={form.isOfficial}
                onChange={(e) => setForm({ ...form, isOfficial: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is-official" className="cursor-pointer text-sm font-medium">
                Official Distributor / Authorized Representative
              </Label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBrand ? "Update Brand" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
