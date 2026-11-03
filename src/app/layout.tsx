import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Nunito } from "next/font/google";
import "../styles.css";

// self-hosted by next/font; cyrillic covers the Mongolian text
const nunito = Nunito({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800", "900"], variable: "--font-nunito", display: "swap" });

const description = "Explore every part of a Mongolian ger in 3D, answer questions to collect them, then build the ger yourself. · Монгол гэрийн хэсэг бүрийг 3D-ээр судалж, гэрээ өөрөө бариарай.";

export const metadata: Metadata = {
  // absolute base for the share image; set NEXT_PUBLIC_SITE_URL to the deployed origin
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "GerQuest — Монгол гэрийн 3D аялал", template: "%s · GerQuest" },
  description,
  applicationName: "GerQuest",
  keywords: ["GerQuest", "Mongolian ger", "yurt", "Монгол гэр", "3D", "education", "quiz"],
  openGraph: { type: "website", siteName: "GerQuest", title: "GerQuest", description, locale: "mn_MN", alternateLocale: ["en_US"] },
  twitter: { card: "summary_large_image", title: "GerQuest", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7fc0ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1c2150" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
