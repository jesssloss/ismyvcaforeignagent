import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Is My VC a Foreign Agent?",
  description: "A quick and easy test to see if your investor is actually a foreign agent blessed with pristine LP capital to steal your tech.",
  openGraph: {
    title: "Is My VC a Foreign Agent? 🕵️",
    description: "Search public government databases to investigate your VC. Epstein files, FARA registry, FBI wanted list, OFAC sanctions, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Is My VC a Foreign Agent? 🕵️",
    description: "Search public government databases to investigate your VC.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
