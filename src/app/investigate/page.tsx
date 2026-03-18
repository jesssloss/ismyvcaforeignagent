import type { Metadata } from "next";
import InvestigateClient from "@/components/InvestigateClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const name = params?.q || "";

  if (!name) {
    return {
      title: "Investigate — Is My VC a Foreign Agent?",
      description: "Search public government databases to investigate your VC.",
    };
  }

  const ogImageUrl = `/api/og?name=${encodeURIComponent(name)}&score=0&verdict=INVESTIGATING...`;

  return {
    title: `${name} — Is My VC a Foreign Agent?`,
    description: `See the Spy Score for ${name}. Searched across Epstein files, FARA registry, FBI wanted list, OFAC sanctions, and SEC EDGAR.`,
    openGraph: {
      title: `🕵️ ${name} — Is My VC a Foreign Agent?`,
      description: `How suspicious is ${name}? Find out their Spy Score.`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `🕵️ ${name} — Spy Score`,
      description: `How suspicious is ${name}? Find out their Spy Score.`,
      images: [ogImageUrl],
    },
  };
}

export default function InvestigatePage() {
  return <InvestigateClient />;
}
