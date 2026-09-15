import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const metadataBase = new URL(process.env.APP_URL ?? "http://localhost:3000");

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase,
  applicationName: "StayBali",
  title: {
    default: "StayBali — Trusted stays across Bali",
    template: "%s | StayBali",
  },
  description:
    "Discover trusted villas, hotels, and homestays across Bali with clear prices and real availability.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StayBali",
    title: "StayBali — Trusted stays across Bali",
    description:
      "Discover trusted villas, hotels, and homestays across Bali with clear prices and real availability.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayBali — Trusted stays across Bali",
    description:
      "Discover trusted villas, hotels, and homestays across Bali with clear prices and real availability.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
