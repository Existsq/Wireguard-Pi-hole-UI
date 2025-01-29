import type { Metadata } from "next";
import { ThemeProvider } from "@/components/general/theme-provider";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";
import { ServerProvider } from "@/components/general/server-context";
import DashboardHeader from "@/components/dashboard/header/dashboard-header";

export const metadata: Metadata = {
  title: "Wireguard Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <head />
      <body className={"min-h-screen bg-background font-sans antialiased"}>
        <ServerProvider>
          <DashboardHeader />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ServerProvider>
        <Toaster />
      </body>
    </html>
  );
}
