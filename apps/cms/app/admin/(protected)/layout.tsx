import React from "react";
import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import PharaanaSidebar from "@/components/partials/sidebar";
import PharaanaHeader from "@/components/partials/header";
import PharaanaFooter from "@/components/partials/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <PharaanaHeader />
      <PharaanaSidebar />
      <LayoutContentProvider>{children}</LayoutContentProvider>
      <PharaanaFooter />
    </LayoutProvider>
  );
}
