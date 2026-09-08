"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    client: "",
    sector: "Aviation Infrastructure",
    location: "Cairo, Egypt",
    summary: "",
    challenges: "",
    solutions: "",
    standards: "",
    featured: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.client || !form.challenges || !form.solutions) {
      toast.error("Please fill in all required fields (title, client, challenges, solutions)");
      return;
    }

    try {
      setSaving(true);
      const imagePayload = images.map((url, idx) => ({ url, order: idx }));

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images: imagePayload,
        }),
      });

      if (res.ok) {
        toast.success("Case study published successfully!");
        router.push("/admin/projects");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create case study");
      }
    } catch {
      toast.error("An error occurred while saving the case study");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects">
            <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Publish Infrastructure Case Study
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Document engineering challenges, lighting formulas, and real photometric outcomes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/projects">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Publish Case Study
          </Button>
        </div>
      </div>

      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Project Identity & Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Case Study Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Cairo International Airport Apron & Terminal High-Mast Lighting"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="client">Client Organization *</Label>
              <Input
                id="client"
                placeholder="e.g. Egyptian Airports Company, Petrojet, NAT"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sector">Sector / Industry *</Label>
              <Input
                id="sector"
                placeholder="e.g. Aviation, Transportation & Tunnels, Heavy Industrial"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Site Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Cairo, Egypt or Port Said, Egypt"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Executive Summary</Label>
            <textarea
              id="summary"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Concise 1-2 sentence overview of the project scope and photometric delivery..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Engineering Retrospective & Technical Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="challenges">Technical Challenges Faced *</Label>
            <textarea
              id="challenges"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Detail glare limitations, corrosive humidity, explosive vapor zones, extreme thermal stress on LED drivers..."
              value={form.challenges}
              onChange={(e) => setForm({ ...form, challenges: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solutions">Genie Light Engineered Solution *</Label>
            <textarea
              id="solutions"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Detail calibrated CCT, luminaire optical distribution, ICAO uniformity ratios, DALI automation, or IP66 impact housings..."
              value={form.solutions}
              onChange={(e) => setForm({ ...form, solutions: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="standards">Photometric & Compliance Standards Achieved</Label>
            <Input
              id="standards"
              placeholder="e.g. ICAO Aerodrome Annex 14, LM80, TM21, UGR<19, ATEX II 2 G Ex db eb, CIE 88"
              value={form.standards}
              onChange={(e) => setForm({ ...form, standards: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Site Photography & Showcase Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project Photography</Label>
            <p className="text-xs text-muted-foreground">
              Upload job-site photography, photometric simulations, and installed luminaire shots.
            </p>
            <ImageUpload
              value={images}
              onChange={setImages}
              disabled={saving}
              maxFiles={12}
              label="Project Photos"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="proj-featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="proj-featured" className="cursor-pointer text-sm font-medium">
              Featured Case Study (Display prominently on Storefront Homepage)
            </Label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
