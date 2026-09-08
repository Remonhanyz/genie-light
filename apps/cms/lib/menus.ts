import { toast } from "@/hooks/use-toast";


// ─── Type Aliases (mirrors Elpharaana's exports) ────────────────────────────
export type layoutType = "vertical" | "horizontal" | "semi-box" | "compact";
export type sidebarType = "classic" | "draggable" | "two-column" | "compact";
export type navBarType = "floating" | "sticky" | "hidden" | "default";
export type skinType = "default" | "bordered";
export type contentType = "wide" | "boxed";

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
};

// ─── Utilities ──────────────────────────────────────────────────────────────
export function hexToRGB(hex: string, alpha?: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return alpha !== undefined
    ? `rgba(${r}, ${g}, ${b}, ${alpha})`
    : `rgb(${r}, ${g}, ${b})`;
}

export function showToastError(error: Error | string) {
  const message = typeof error === "string" ? error : error.message;
  toast({ title: "Error", description: message, variant: "destructive" });
}

export interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

export interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

export const adminMenu: MenuGroup[] = [
  {
    groupLabel: "Overview",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: "heroicons:squares-2x2",
      },
    ],
  },
  {
    groupLabel: "Technical Catalog",
    items: [
      {
        href: "/admin/products",
        label: "Products & Variants",
        icon: "heroicons:light-bulb",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: "heroicons:folder-open",
      },
      {
        href: "/admin/brands",
        label: "Partner Brands",
        icon: "heroicons:tag",
      },
      {
        href: "/admin/datasheets",
        label: "Technical Datasheets",
        icon: "heroicons:document-arrow-down",
      },
    ],
  },
  {
    groupLabel: "Operations & Fulfillment",
    items: [
      {
        href: "/admin/orders",
        label: "Customer Orders",
        icon: "heroicons:shopping-cart",
      },
      {
        href: "/admin/delivery-fees",
        label: "Governorate Shipping",
        icon: "heroicons:truck",
      },
    ],
  },
  {
    groupLabel: "Showcase & Portfolio",
    items: [
      {
        href: "/admin/projects",
        label: "Project Case Studies",
        icon: "heroicons:building-office-2",
      },
    ],
  },
  {
    groupLabel: "User Management",
    items: [
      {
        href: "/admin/users",
        label: "User Accounts",
        icon: "heroicons:users",
      },
    ],
  },
];

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: string;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  id: string;
  href: string;
  label: string;
  active: boolean;
  icon: string;
  submenus: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, role?: string): Group[] {
  const isDataEntry = role === "DATA_ENTRY";

  return adminMenu
    .map((group, idx) => {
      const filteredItems = group.items.filter((item) => {
        if (isDataEntry) {
          if (item.href === "/admin/orders") return false;
          if (item.href === "/admin/delivery-fees") return false;
          if (item.href === "/admin/users") return false;
        }
        return true;
      });

      return {
        groupLabel: group.groupLabel,
        id: `group-${idx}`,
        menus: filteredItems.map((item, itemIdx) => ({
          id: `menu-${idx}-${itemIdx}`,
          href: item.href,
          label: item.label,
          active: pathname === item.href || pathname.startsWith(item.href + "/"),
          icon: item.icon,
          submenus: [],
        })),
      };
    })
    .filter((group) => group.menus.length > 0);
}

export function getHorizontalMenuList(pathname: string, role?: string): Group[] {
  return getMenuList(pathname, role);
}

