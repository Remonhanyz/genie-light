"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessRestrictedProps {
  moduleName?: string;
  message?: string;
}

export function AccessRestricted({
  moduleName = "Financial & Fulfillment Operations",
  message = "Data Entry specialists have catalog management privileges (Products, Categories, Brands, Datasheets, Projects). Access to customer orders, shipping configuration, revenue analytics, and system users is restricted to Administrators.",
}: AccessRestrictedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 border border-amber-500/20 shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">
        Access Restricted: {moduleName}
      </h2>

      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs shadow-sm">
            <Lightbulb className="w-4 h-4" />
            Go to Products Catalog
          </Button>
        </Link>
        <Link href="/admin/datasheets">
          <Button variant="outline" className="text-xs gap-2">
            Technical Datasheets
          </Button>
        </Link>
      </div>
    </div>
  );
}
