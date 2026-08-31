import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin", "latin-ext", "cyrillic"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
