import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Genie Light - Admin Management Console",
  description: "Back-Office Catalog & Operations Management Portal for Genie Light Egypt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MountedProvider>
            {children}
            <Toaster closeButton position="top-right" richColors />
          </MountedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
