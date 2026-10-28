import type { Metadata, Viewport } from "next";
import "./globals.css";
import WelcomeSplash from "@/components/welcome-splash";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Mobile Gallary | Mobile, Repair, Care",
  description:
    "Discover mobile devices, accessories, and expert phone repairs at Mobile Gallary.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><WelcomeSplash />{children}</body>
    </html>
  );
}
