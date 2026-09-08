"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n-client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { TableLoader } from "@/components/ui/table-loader";
import { toast } from "sonner";
import { useSortableData } from "@/hooks/use-sortable-data";
import { ImageUpload } from "@/components/ui/image-upload";

interface Category {
  id: string;
  name: string;
  image?: string | null;
  imageUrl?: string | null;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items: sortedCategories, requestSort, sortConfig } = useSortableData(categories);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setName("");
    setImage("");
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setName(category.name);
    setImage(category.imageUrl || category.image || "");
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image: image.trim() || null }),
      });

      if (res.ok) {
        toast.success(editingId ? "Category updated successfully" : "Category created successfully");
        setIsOpen(false);
        setName("");
        setImage("");
        setEditingId(null);
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save category");
      }
    } catch {
      toast.error("Error saving category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isActive = sortConfig?.field === field;
    return (
      <div className="flex items-center gap-1.5 w-full">
        <span>{label}</span>
        <span className="flex-none rounded-md p-0.5 text-default-400 group-hover:bg-default-300/50 dark:group-hover:bg-default-700/50 group-hover:text-default-900 dark:group-hover:text-default-100 transition-colors">
          {isActive ? (
            sortConfig.asc ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("categories")}</h2>
          <p className="text-muted-foreground">{t("categories_description")}</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-default-200">
              <TableRow>
                <TableHead className="w-24">Preview</TableHead>
                <TableHead
                  onClick={() => requestSort("name")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader(t("category_name"), "name")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("_count.products")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Linked Products", "_count.products")}
                </TableHead>
                <TableHead className="w-24 text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableLoader colSpan={4} rows={5} />
              ) : sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground normal-case">
                    No categories defined.
                  </TableCell>
                </TableRow>
              ) : (
                sortedCategories.map((c) => {
                  const productCount = c._count?.products || 0;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="normal-case">
                        {c.imageUrl || c.image ? (
                          <img
                            src={c.imageUrl || c.image || ""}
                            alt={c.name}
                            className="h-10 w-10 object-contain rounded bg-default-100 border border-border"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML =
                                  '<div class="h-10 w-10 bg-muted flex items-center justify-center rounded text-[10px] text-muted-foreground">No Img</div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded text-[10px] text-muted-foreground border border-border/50">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold normal-case">{c.name}</TableCell>
                      <TableCell className="normal-case">
                        {productCount} {productCount === 1 ? "product" : "products"}
                      </TableCell>
                      <TableCell className="py-3 text-right normal-case">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleOpenEdit(c)} className="cursor-pointer">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setDeleteId(c.id)}
                            className="text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setName("");
            setImage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  {t("category_name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Architectural Linear, Track Spotlights, High Bay, Downlights"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Category Image</Label>
                <ImageUpload
                  value={image ? [image] : []}
                  onChange={(urls) => setImage(urls[0] || "")}
                  disabled={isSaving}
                  maxFiles={1}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="cursor-pointer gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? All linked products will lose their category association."
        confirmText="Delete Category"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        loading={isDeleting}
      />
    </div>
  );
}
