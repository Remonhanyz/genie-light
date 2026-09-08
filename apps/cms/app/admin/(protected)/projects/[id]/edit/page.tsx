"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

type Params = { id: string };

export default function EditProjectPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    client: "",
    sector: "",
    location: "",
    summary: "",
    challenges: "",
    solutions: "",
    standards: "",
    featured: false,
    imageUrls: "",
  });

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title || "",
            client: data.client || "",
            sector: data.sector || "",
            location: data.location || "",
            summary: data.summary || "",
            challenges: data.challenges || "",
            solutions: data.solutions || "",
            standards: data.standards || "",
            featured: data.featured || false,
            imageUrls: (data.images || []).map((img: any) => img.url).join("\n"),
          });
        } else {
          toast.error("Failed to load project details");
        }
      } catch {
        toast.error("Error loading project");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const images = form.imageUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url, idx) => ({ url, order: idx }));

      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images,
        }),
      });

      if (res.ok) {
        toast.success("Case study updated successfully!");
        router.push("/admin/projects");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update case study");
      }
    } catch {
      toast.error("An error occurred while saving the case study");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
        Loading case study details...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
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
              Edit Infrastructure Case Study
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update site metrics, engineered solution notes, and standards.
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
            Save Changes
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
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sector">Sector / Industry *</Label>
              <Input
                id="sector"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">Site Location *</Label>
              <Input
                id="location"
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
              value={form.solutions}
              onChange={(e) => setForm({ ...form, solutions: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="standards">Photometric & Compliance Standards Achieved</Label>
            <Input
              id="standards"
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
            <Label htmlFor="images">Job-Site Photography URLs (One per line)</Label>
            <textarea
              id="images"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.imageUrls}
              onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="proj-featured-edit"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="proj-featured-edit" className="cursor-pointer text-sm font-medium">
              Featured Case Study (Display prominently on Storefront Homepage)
            </Label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
