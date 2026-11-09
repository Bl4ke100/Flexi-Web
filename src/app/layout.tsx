import type { Metadata } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "FLEXI RENTAL // Everyday Car, SUV & Van Rental in Sri Lanka",
  description:
    "Reliable self-drive and with-driver car rentals across Sri Lanka. Hybrid cars, sedans, SUVs, and KDH vans with 24/7 Katunayake Airport pickup and Colombo delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="font-sans antialiased bg-[#050505] text-white">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
