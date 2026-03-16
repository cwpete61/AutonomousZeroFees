import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Orbis Outreach - BPS — Autonomous Lead Generation",
  description:
    "AI-powered lead discovery, outreach, and web design fulfillment. Find businesses with bad websites, close deals, and deliver sites — all on autopilot.",
  openGraph: {
    title: "Orbis Outreach - BPS — Autonomous Lead Generation",
    description:
      "AI-powered lead discovery, outreach, and web design fulfillment. Zero manual work.",
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
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
