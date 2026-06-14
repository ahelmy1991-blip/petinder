import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallBanner from "@/components/InstallBanner";

export const metadata: Metadata = {
  title: "Petinder — Find Your Perfect Pet Match",
  description: "Swipe to find your perfect rescue pet. Cairo's AI-powered pet adoption & services platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Petinder",
  },
  openGraph: {
    title: "Petinder",
    description: "Swipe to find your perfect rescue pet.",
    type: "website",
    siteName: "Petinder",
  },
  twitter: {
    card: "summary",
    title: "Petinder",
    description: "Swipe to find your perfect rescue pet.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#f97316" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
        <ServiceWorkerRegistrar />
        <Navbar />
        <main className="pt-16 min-h-screen">{children}</main>
        <InstallBanner />
      </body>
    </html>
  );
}
