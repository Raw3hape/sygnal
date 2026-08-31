import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const display = Nunito({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Sygnal",
  description: "Interactive 3D driving-rules trainer for Europe, the US and CIS, in English, Polish and Russian.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sygnal",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
