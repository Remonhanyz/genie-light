"use client";

import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [config] = useConfig();

  // Apply radius CSS variable to :root whenever config.radius changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--radius",
      `${config.radius}rem`
    );
  }, [config.radius]);

  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col bg-default-100 dark:bg-background transition-all duration-300",
        {
          "bg-transparent": config.skin === "bordered",
          "xl:px-20": config.layout === "semi-box",
          "lg:p-10 p-6": config.layout === "compact",
        }
      )}
    >
      {children}
    </div>
  );
};

export default LayoutProvider;
