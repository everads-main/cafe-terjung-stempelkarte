import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Terjung Karte",
  description: "Stempelkarte von Bäckerei Terjung – zehn Tassen, der nächste ist frei.",
  applicationName: "Terjung Karte",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Terjung",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ef8017",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}
        <PwaRegister />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
