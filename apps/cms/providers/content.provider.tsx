"use client";

import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import React from "react";

const LayoutContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [config] = useConfig();

  return (
    <main
      className={cn("flex-1 transition-all duration-300 xl:ms-[248px]", {
        "xl:ms-[72px]": config.collapsed,
        "bg-default-100 dark:bg-background": config.skin === "default",
        "bg-transparent": config.skin === "bordered",
        "xl:ms-0": config.menuHidden || config.layout === "horizontal",
        "xl:ms-28": config.sidebar === "compact",
        "pt-6": config.navbar === "floating" && config.layout !== "semi-box",
      })}
    >
      <div
        className={cn("mb-24 md:mb-0", {
          "container mx-auto max-w-[1400px] px-6": config.contentWidth === "boxed",
          "p-6": config.layout !== "semi-box",
          "py-10": config.layout === "semi-box",
          "lg:p-0 px-0 lg:ms-6 mt-6 md:mb-6": config.layout === "compact",
        })}
      >
        {children}
      </div>
    </main>
  );
};

export default LayoutContentProvider;
