"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cog, Truck, CreditCard, Save } from "lucide-react";
import { toast } from "sonner";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    codShippingFee: "0.0",
    factionCodeFee: "0.0",
  });

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setForm({
          codShippingFee: data.codShippingFee.toString(),
          factionCodeFee: data.factionCodeFee.toString(),
        });
      } else {
        toast.error("Failed to load configuration settings");
      }
    } catch {
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codShippingFee: parseFloat(form.codShippingFee) || 0,
          factionCodeFee: parseFloat(form.factionCodeFee) || 0,
        }),
      });

      if (res.ok) {
        toast.success("System settings updated successfully");
        loadSettings();
      } else {
        toast.error("Failed to save changes");
      }
    } catch {
      toast.error("An error occurred while updating settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground animate-pulse">
        Loading system logistics configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Cog className="h-8 w-8 text-primary animate-spin-slow" /> System Settings
        </h2>
        <p className="text-muted-foreground">
          Modify global e-commerce logistics fees and Faction Code parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-default-200 shadow-lg backdrop-blur-md bg-default-50/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-default-100 bg-default-100/50">
            <CardTitle className="text-xl flex items-center gap-2 font-semibold">
              <Truck className="h-5 w-5 text-indigo-500" /> Logistics & Shipping Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="codShippingFee" className="text-sm font-medium">
                Cash on Delivery (COD) Shipping Fee (EGP)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">
                  EGP
                </span>
                <Input
                  id="codShippingFee"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-12 font-semibold"
                  value={form.codShippingFee}
                  onChange={(e) => setForm({ ...form, codShippingFee: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This shipping surcharge will automatically apply to any checkout using Cash on Delivery.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-default-200 shadow-lg backdrop-blur-md bg-default-50/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-default-100 bg-default-100/50">
            <CardTitle className="text-xl flex items-center gap-2 font-semibold">
              <CreditCard className="h-5 w-5 text-emerald-500" /> Faction Code Generation Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="factionCodeFee" className="text-sm font-medium">
                Optional Faction Code Fee (EGP)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">
                  EGP
                </span>
                <Input
                  id="factionCodeFee"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-12 font-semibold"
                  value={form.factionCodeFee}
                  onChange={(e) => setForm({ ...form, factionCodeFee: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Extra charge added to checkout when a returning customer chooses to generate a new faction code for their blaster.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2 cursor-pointer transition-all active:scale-95 shadow-md">
            <Save className="h-4 w-4" /> {saving ? "Saving settings..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
