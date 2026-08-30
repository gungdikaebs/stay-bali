import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StayBali — Trusted stays across Bali",
    template: "%s | StayBali",
  },
  description:
    "Discover trusted villas, hotels, and homestays across Bali with clear prices and real availability.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
