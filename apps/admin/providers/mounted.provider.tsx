"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function MountedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Initializing Admin Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
