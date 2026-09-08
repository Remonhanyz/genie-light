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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  Search,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Coins,
  Loader2,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccessRestricted } from "@/components/auth/access-restricted";

interface DeliveryZone {
  id: string;
  governorate: string;
  deliveryFee: number | string;
  estimatedDays: string;
  active: boolean;
}

const COMMON_TRANSIT_TIMES = [
  "1-2 Business Days",
  "2-3 Business Days",
  "3-5 Business Days",
  "4-6 Business Days",
  "5-7 Business Days",
];

export default function DeliveryFeesPage() {
  const { isDataEntry } = useCurrentUser();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    governorate: "",
    deliveryFee: "60",
    estimatedDays: "2-3 Business Days",
    active: true,
  });

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/delivery-fees");
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      } else {
        toast.error("Failed to load delivery rates");
      }
    } catch {
      toast.error("Failed to fetch Egyptian delivery rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const openAddDialog = () => {
    setEditingZone(null);
    setForm({
      governorate: "",
      deliveryFee: "90",
      estimatedDays: "2-3 Business Days",
      active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setForm({
      governorate: zone.governorate,
      deliveryFee: zone.deliveryFee.toString(),
      estimatedDays: zone.estimatedDays,
      active: zone.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.governorate.trim()) {
      toast.error("Please enter a governorate name");
      return;
    }

    try {
      setSaving(true);

      if (editingZone) {
        // Edit existing
        const res = await fetch(`/api/delivery-fees/${editingZone.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            governorate: form.governorate.trim(),
            deliveryFee: parseFloat(form.deliveryFee) || 0,
            estimatedDays: form.estimatedDays.trim(),
            active: form.active,
          }),
        });

        if (res.ok) {
          toast.success(`Updated rates for ${form.governorate.trim()}`);
          setDialogOpen(false);
          fetchZones();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to update delivery fee");
        }
      } else {
        // Create new
        const res = await fetch("/api/delivery-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            governorate: form.governorate.trim(),
            deliveryFee: parseFloat(form.deliveryFee) || 0,
            estimatedDays: form.estimatedDays.trim(),
            active: form.active,
          }),
        });

        if (res.ok) {
          toast.success(`Added ${form.governorate.trim()} delivery zone`);
          setDialogOpen(false);
          fetchZones();
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to add delivery zone");
        }
      }
    } catch {
      toast.error("An error occurred while saving delivery rates");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (zone: DeliveryZone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!zoneToDelete) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/delivery-fees/${zoneToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Deleted ${zoneToDelete.governorate} delivery zone`);
        setDeleteDialogOpen(false);
        setZoneToDelete(null);
        fetchZones();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete delivery zone");
      }
    } catch {
      toast.error("An error occurred while deleting delivery zone");
    } finally {
      setDeleting(false);
    }
  };

  const filteredZones = zones.filter((z) =>
    z.governorate.toLowerCase().includes(search.toLowerCase())
  );

  const cairoZone = zones.find((z) => z.governorate.toLowerCase() === "cairo");
  const averageFee = zones.length > 0
    ? (zones.reduce((acc, z) => acc + Number(z.deliveryFee), 0) / zones.length).toFixed(0)
    : "0";

  if (isDataEntry) {
    return <AccessRestricted moduleName="Egyptian Governorate Shipping Rates" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Egyptian Governorate Shipping Rates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure dynamic delivery fees and estimated transit durations for Egyptian contractor orders.
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Governorate
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Covered Governorates</CardTitle>
              <CardDescription>Egyptian delivery zones</CardDescription>
            </div>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-foreground">
              {zones.filter((z) => z.active).length} / {zones.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active shipping coverage across Egyptian governorates.
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Greater Cairo Rate</CardTitle>
              <CardDescription>Cairo baseline fee</CardDescription>
            </div>
            <Coins className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {cairoZone ? `${Number(cairoZone.deliveryFee).toFixed(2)} EGP` : "60.00 EGP"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cairoZone ? cairoZone.estimatedDays : "Standard 1-2 Business Days"}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Average Delivery Fee</CardTitle>
              <CardDescription>Across all Egyptian zones</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-foreground">~{averageFee} EGP</div>
            <p className="text-xs text-muted-foreground mt-1">
              Expedited courier delivery via Genie Light transport fleet.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by governorate (e.g. Cairo, Alexandria, Port Said, Aswan)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong>{filteredZones.length}</strong> of {zones.length} governorates
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          Loading governorate shipping rates...
        </div>
      ) : (
        <Card className="border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-3.5">Governorate</th>
                  <th className="px-6 py-3.5">Shipping Fee (EGP)</th>
                  <th className="px-6 py-3.5">Estimated Transit Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No governorate shipping rates found matching &quot;{search}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {zone.governorate}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {Number(zone.deliveryFee).toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {zone.estimatedDays}
                      </td>
                      <td className="px-6 py-4">
                        {zone.active ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                            Active Coverage
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-xs">
                            Suspended
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => openEditDialog(zone)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => openDeleteDialog(zone)}
                            title={`Delete ${zone.governorate}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Rate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              {editingZone ? `Edit Shipping: ${editingZone.governorate}` : "Add New Egyptian Governorate"}
            </DialogTitle>
            <DialogDescription>
              {editingZone
                ? "Update delivery charges, transit timeline, and coverage status."
                : "Register a new Egyptian delivery zone for shipping fee calculation at checkout."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="governorate-name">Governorate Name *</Label>
              <Input
                id="governorate-name"
                placeholder="e.g. Cairo, Alexandria, New Capital..."
                value={form.governorate}
                onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery-fee">Shipping Fee (EGP) *</Label>
              <Input
                id="delivery-fee"
                type="number"
                step="5"
                min="0"
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Flat fee applied to checkout orders destined for this governorate.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estimated-days">Estimated Delivery Transit *</Label>
              <Input
                id="estimated-days"
                placeholder="e.g. 1-2 Business Days"
                value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                required
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_TRANSIT_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setForm({ ...form, estimatedDays: time })}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-muted hover:bg-primary/15 hover:text-primary transition-colors border border-border"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="zone-active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="zone-active" className="cursor-pointer text-sm font-medium">
                Active Shipping Zone (Available in Checkout)
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
                {editingZone ? "Save Shipping Rates" : "Create Governorate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Delivery Zone
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <strong>{zoneToDelete?.governorate}</strong> from shipping zones? Customers will no longer be able to select this governorate during checkout.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
