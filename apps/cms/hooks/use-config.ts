"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type LayoutType = "vertical" | "horizontal" | "semi-box" | "compact";
export type SidebarType = "classic" | "draggable" | "two-column" | "compact";
export type NavbarType = "floating" | "sticky" | "hidden" | "default";

export type Config = {
  collapsed: boolean;
  theme: string;
  skin: "default" | "bordered";
  layout: LayoutType;
  sidebar: SidebarType;
  menuHidden: boolean;
  showSearchBar: boolean;
  topHeader: "default" | "links";
  contentWidth: "wide" | "boxed";
  navbar: NavbarType;
  footer: "sticky" | "default" | "hidden";
  sidebarColor: string;
  headerColor: string;
  sidebarBgImage?: string;
  radius: number;
  showSwitcher: boolean;
  subMenu: boolean;
  hasSubMenu: boolean;
};

export const defaultConfig: Config = {
  collapsed: false,
  theme: "zinc",
  skin: "default",
  layout: "vertical",
  sidebar: "classic",
  menuHidden: false,
  showSearchBar: true,
  topHeader: "default",
  contentWidth: "wide",
  navbar: "sticky",
  footer: "default",
  sidebarColor: "light",
  headerColor: "light",
  sidebarBgImage: undefined,
  radius: 0.5,
  showSwitcher: true,
  subMenu: false,
  hasSubMenu: false,
};

const configAtom = atomWithStorage<Config>("cms-layout-config", defaultConfig);
const hoverConfigAtom = atomWithStorage("hoverConfig", { hovered: false });
const mobileMenuAtom = atomWithStorage("mobileMenu", { isOpen: false });

export function useConfig() {
  return useAtom(configAtom);
}

export function useMenuHoverConfig() {
  return useAtom(hoverConfigAtom);
}

export function useMobileMenuConfig() {
  return useAtom(mobileMenuAtom);
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
