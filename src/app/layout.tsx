import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteContentProvider } from "@/components/SiteContentProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "FLEXI RENTAL // Everyday Car, SUV & Van Rental in Sri Lanka",
  description:
    "Short- and long-term car rentals, airport pickup and return, and luxury wedding cars in Sri Lanka. Explore the Flexi Rental fleet and request a quote on WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="font-sans antialiased bg-[#050505] text-white">
        <SiteContentProvider>{children}</SiteContentProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
