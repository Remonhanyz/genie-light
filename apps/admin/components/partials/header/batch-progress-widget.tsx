"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Layers } from "lucide-react";

export default function BatchProgressWidget() {
  const [subProductCount, setSubProductCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/products/stats");
        if (res.ok) {
          const data = await res.json();
          setSubProductCount(data.totalSubProducts ?? 0);
        }
      } catch {
        // graceful fallback
      }
    }
    fetchStats();
  }, []);

  if (subProductCount === null) return null;

  const currentBatch = subProductCount % 30;
  const completedBatches = Math.floor(subProductCount / 30);

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-xs text-primary-700 dark:text-primary-300 font-medium select-none shadow-xs">
      <Layers className="w-3.5 h-3.5 text-primary" />
      <span>Milestone Batch:</span>
      <span className="font-bold text-primary-800 dark:text-primary-200">
        {currentBatch} / 30
      </span>
      {completedBatches > 0 && (
        <span className="text-[10px] text-default-500 flex items-center gap-0.5">
          ({completedBatches} complete <CheckCircle2 className="w-3 h-3 text-emerald-500" />)
        </span>
      )}
    </div>
  );
}
