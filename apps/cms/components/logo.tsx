"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useConfig, useMenuHoverConfig, useMediaQuery } from "@/hooks/use-config";

const Logo = () => {
  const [config] = useConfig();
  const [hoverConfig] = useMenuHoverConfig();
  const { hovered } = hoverConfig;
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (config.sidebar === "compact") {
    return (
      <Link href="/admin/dashboard" className="flex gap-2 items-center justify-center p-2">
        <Image
          src="/images/logo/genie-light-logo.png"
          alt="Genie Light"
          width={40}
          height={40}
          className="h-10 w-auto shrink-0 object-contain"
          priority
        />
      </Link>
    );
  }

  if (config.sidebar === "two-column" || !isDesktop) return null;

  const showFullLogo = !config?.collapsed || hovered;

  return (
    <Link href="/admin/dashboard" className="flex gap-2.5 items-center px-3 py-2">
      {showFullLogo ? (
        <Image
          src="/images/logo/genie-light-logo.png"
          alt="Genie Light - Innovative Lighting Solutions"
          width={180}
          height={45}
          className="h-10 w-auto shrink-0 object-contain"
          priority
        />
      ) : (
        <Image
          src="/images/logo/genie-light-logo.png"
          alt="Genie Light"
          width={36}
          height={36}
          className="h-9 w-auto shrink-0 object-contain"
          priority
        />
      )}
    </Link>
  );
};

export default Logo;
