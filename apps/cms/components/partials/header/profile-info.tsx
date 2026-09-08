"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { 
  LayoutDashboard, 
  LogOut, 
  Package, 
  ShoppingCart, 
  ChevronDown, 
  Loader2,
  HelpCircle,
  Brain
} from "lucide-react";
import { getAdminDataLocal } from "@/lib/auth-server";

type UserType = Awaited<ReturnType<typeof getAdminDataLocal>>;

const ProfileInfo = ({ user }: { user: UserType }) => {
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-border hover:bg-default-100/50 cursor-pointer select-none transition-all duration-200">
            <div className="relative">
              {user.picture && typeof user.picture === "string" ? (
                <Image
                  src={user.picture}
                  alt={user.name || "U"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold ring-2 ring-border">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online status indicator dot */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="text-sm font-semibold text-default-850 capitalize lg:block hidden max-w-[100px] truncate">
              {user.name}
            </div>
            
            <ChevronDown className="h-4 w-4 text-default-400 lg:block hidden transition-transform duration-200" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-1.5 rounded-xl border border-border shadow-lg bg-popover text-popover-foreground" align="end">
          <DropdownMenuLabel className="flex gap-3 items-center p-3 rounded-lg bg-muted/40 border border-border mb-1.5">
            <div className="relative flex-none">
              {user.picture && typeof user.picture === "string" ? (
                <Image
                  src={user.picture}
                  alt={user.name || "U"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-bold">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-default-900 capitalize truncate">
                {user.name}
              </div>
              <div className="text-xs text-default-500 truncate">
                {user.email}
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 mt-1 uppercase tracking-wider">
                HQ Administrator
              </span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-1 my-1" />
          
          <div className="space-y-0.5">
            <Link href="/admin/dashboard" passHref>
              <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-default-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-default-100 hover:text-default-900 focus:bg-default-100 focus:text-default-900 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-default-400" />
                HQ Dashboard Overview
              </DropdownMenuItem>
            </Link>

            <Link href="/admin/products" passHref>
              <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-default-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-default-100 hover:text-default-900 focus:bg-default-100 focus:text-default-900 transition-colors">
                <Package className="w-4 h-4 text-default-400" />
                Products Catalog
              </DropdownMenuItem>
            </Link>

            <Link href="/admin/orders" passHref>
              <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-default-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-default-100 hover:text-default-900 focus:bg-default-100 focus:text-default-900 transition-colors">
                <ShoppingCart className="w-4 h-4 text-default-400" />
                Customer Orders Ledger
              </DropdownMenuItem>
            </Link>

            <Link href="/admin/faqs" passHref>
              <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-default-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-default-100 hover:text-default-900 focus:bg-default-100 focus:text-default-900 transition-colors">
                <HelpCircle className="w-4 h-4 text-default-400" />
                Frequently Asked FAQs
              </DropdownMenuItem>
            </Link>

            <Link href="/admin/quiz" passHref>
              <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-default-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-default-100 hover:text-default-900 focus:bg-default-100 focus:text-default-900 transition-colors">
                <Brain className="w-4 h-4 text-default-400" />
                Alignment Quiz Setup
              </DropdownMenuItem>
            </Link>
          </div>

          <DropdownMenuSeparator className="mx-1 my-1" />

          <button
            type="button"
            onClick={() => {
              startTransition(async () => {
                try {
                  const res = await fetch("/api/auth", { method: "DELETE" });
                  if (res.ok) {
                    window.location.href = "/admin/login";
                  }
                } catch (err) {
                  console.error("Logout failed:", err);
                }
              });
            }}
            disabled={isPending}
            className="w-full flex items-center gap-2.5 text-sm font-semibold text-destructive rounded-lg px-3 py-2.5 cursor-pointer hover:bg-destructive/10 disabled:opacity-50 transition-colors duration-150"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-destructive" />
            ) : (
              <LogOut className="w-4 h-4 text-destructive" />
            )}
            {isPending ? "Logging out..." : "Log out"}
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;
