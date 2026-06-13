import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Petinder — Find Your Perfect Pet Match",
  description: "Swipe to find your perfect rescue pet. AI-powered matching based on your lifestyle.",
  openGraph: {
    title: "Petinder",
    description: "Swipe to find your perfect rescue pet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
        <Navbar />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
