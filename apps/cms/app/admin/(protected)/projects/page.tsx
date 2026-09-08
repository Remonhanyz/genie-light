"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  MapPin,
  Loader2,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ProjectCaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  sector: string;
  location: string;
  summary: string;
  challenges: string;
  solutions: string;
  standards: string | null;
  featured: boolean;
  _count?: { images: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      toast.error("Failed to load project case studies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Case study "${title}" removed`);
        fetchProjects();
      } else {
        toast.error("Failed to delete case study");
      }
    } catch {
      toast.error("Error deleting case study");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Infrastructure Case Studies CMS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage high-profile verified national projects, engineered solutions, and photometric standards.
          </p>
        </div>

        <Link href="/admin/projects/new">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Case Study
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="border bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search case studies by title, client (Petrojet, Cairo Airport), or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong>{filteredProjects.length}</strong> of {projects.length} case studies
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          Loading case studies...
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border p-12 text-center text-muted-foreground bg-card">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-base font-semibold">No case studies found</p>
          <p className="text-sm mt-1">Add your first verified project showcase retrospective.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              className="border hover:border-primary/50 transition-all shadow-xs bg-card flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="bg-muted text-xs font-normal">
                    {p.sector}
                  </Badge>
                  {p.featured && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-bold mt-2 line-clamp-2">
                  {p.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{p.client}</span>
                  <span>•</span>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{p.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {p.summary}
                </p>

                {p.standards && (
                  <div className="text-[11px] font-mono text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                    Standards: {p.standards}
                  </div>
                )}

                <div className="pt-3 border-t flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {p._count?.images ?? 0} Job-site Photos
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/projects/${p.id}/edit`}>
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p.id, p.title)}
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
    </div>
  );
}
