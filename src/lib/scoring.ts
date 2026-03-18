import {
  SourceResult,
  SpyScore,
  Signal,
  EpsteinResult,
  EpsteinInvestigationResult,
  FARAResult,
  OFACResult,
  FBIResult,
  SECResult,
} from "./types";

export function calculateSpyScore(results: SourceResult[]): SpyScore {
  let score = 0;
  const signals: Signal[] = [];

  // ── Epstein File Explorer ──
  const epstein = results.find((r) => r.source === "epstein_files") as EpsteinResult | undefined;
  if (epstein?.hit) {
    const topPerson = epstein.persons?.[0];
    const docCount = topPerson?.documentCount || 0;
    const connCount = topPerson?.connectionCount || 0;

    if (docCount > 100) {
      score += 30;
      signals.push({ text: `Named in ${docCount} Epstein documents`, severity: "critical", icon: "📁" });
    } else if (docCount > 20) {
      score += 20;
      signals.push({ text: `Named in ${docCount} Epstein documents`, severity: "high", icon: "📁" });
    } else if (docCount > 0) {
      score += 12;
      signals.push({ text: `Named in ${docCount} Epstein documents`, severity: "medium", icon: "📁" });
    } else {
      score += 8;
      signals.push({ text: `Named in Epstein file network`, severity: "medium", icon: "📁" });
    }

    if (connCount > 10) {
      score += 8;
      signals.push({ text: `${connCount} connections in Epstein network`, severity: "high", icon: "🕸️" });
    } else if (connCount > 0) {
      score += 4;
    }
  }

  // ── Epstein Investigation (flight logs + entities) ──
  const epInv = results.find((r) => r.source === "epstein_investigation") as EpsteinInvestigationResult | undefined;
  if (epInv?.hit) {
    if (epInv.flights.length > 0) {
      score += 25;
      signals.push({
        text: `On ${epInv.totalFlights} Epstein flight log${epInv.totalFlights > 1 ? "s" : ""} (Lolita Express)`,
        severity: "critical",
        icon: "✈️",
      });
    }

    if (epInv.entities.length > 0) {
      const entity = epInv.entities[0];
      if (entity.documentCount > 0 || entity.emailCount > 0) {
        score += 10;
        const parts = [];
        if (entity.documentCount > 0) parts.push(`${entity.documentCount} documents`);
        if (entity.emailCount > 0) parts.push(`${entity.emailCount} emails`);
        signals.push({
          text: `Epstein investigation: ${parts.join(", ")}`,
          severity: "high",
          icon: "🔍",
        });
      }
      if (entity.roleDescription) {
        signals.push({
          text: `Role: "${entity.roleDescription}"`,
          severity: "medium",
          icon: "🏷️",
        });
      }
    }
  }

  // ── FARA — Foreign Agents Registration Act ──
  const fara = results.find((r) => r.source === "fara") as FARAResult | undefined;
  if (fara?.hit) {
    const activeMatches = fara.matches.filter(m => !m.terminationDate);
    const countries = [...new Set(fara.matches.map(m => m.country).filter(c => c && c !== "See FARA filing"))];
    
    if (activeMatches.length > 0) {
      score += 35;
      signals.push({
        text: `ACTIVELY registered as a foreign agent${countries.length > 0 ? ` (${countries.slice(0, 3).join(", ")})` : ""}`,
        severity: "critical",
        icon: "🌐",
      });
    } else {
      score += 20;
      signals.push({
        text: `FARA registered foreign agent (terminated)${countries.length > 0 ? ` — ${countries.slice(0, 3).join(", ")}` : ""}`,
        severity: "high",
        icon: "🌐",
      });
    }
  }

  // ── OFAC / Sanctions / OpenSanctions ──
  const ofac = results.find((r) => r.source === "ofac_sanctions") as OFACResult | undefined;
  if (ofac?.hit && ofac.results?.length > 0) {
    const allDatasets = ofac.results.flatMap(r => r.datasets);
    const allTopics = ofac.results.flatMap(r => r.topics);

    // Actual sanctions lists — maximum severity
    if (allDatasets.some(d => d.includes("ofac") || d.includes("sdn") || d.includes("sanction"))) {
      score += 40;
      signals.push({ text: `On government sanctions list`, severity: "critical", icon: "🚫" });
    }

    // Enforcement actions
    if (allDatasets.some(d => d.includes("enforcement"))) {
      score += 20;
      const enfDs = allDatasets.filter(d => d.includes("enforcement"));
      signals.push({ 
        text: `Government enforcement action (${enfDs.join(", ")})`, 
        severity: "critical", 
        icon: "⚖️" 
      });
    }

    // Oligarch designation
    if (allDatasets.some(d => d.includes("oligarch")) || allTopics.some(t => t.includes("oligarch"))) {
      score += 25;
      signals.push({ text: `Designated as oligarch`, severity: "critical", icon: "💰" });
    }

    // Politically exposed person
    if (allDatasets.some(d => d.includes("pep")) || allTopics.some(t => t.includes("pep") || t.includes("role.pep"))) {
      score += 10;
      signals.push({ text: `Politically exposed person (PEP)`, severity: "high", icon: "🏛️" });
    }

    // Interpol / FBI
    if (allDatasets.some(d => d.includes("interpol") || d.includes("fbi") || d.includes("wanted"))) {
      score += 35;
      signals.push({ text: `International law enforcement watchlist`, severity: "critical", icon: "🔍" });
    }

    // Curated notable person (lower weight — just means they're notable)
    if (!allDatasets.some(d => d.includes("sanction") || d.includes("enforcement") || d.includes("oligarch") || d.includes("pep") || d.includes("wanted"))) {
      // Only wikidata/categories — don't add score, just note it
      if (allDatasets.some(d => d === "wd_curated")) {
        signals.push({ text: `Notable person in curated watchlist databases`, severity: "low", icon: "📋" });
      }
    }
  }

  // ── FBI Wanted ──
  const fbi = results.find((r) => r.source === "fbi_wanted") as FBIResult | undefined;
  if (fbi?.hit) {
    score += 40;
    signals.push({
      text: `Listed on FBI Wanted database`,
      severity: "critical",
      icon: "🔍",
    });
  }

  // ── SEC Enforcement ──
  const sec = results.find((r) => r.source === "sec_enforcement") as SECResult | undefined;
  if (sec?.hit && sec.totalFilings > 0) {
    // SEC filings are common for anyone in business — only flag if very high or enforcement-specific
    if (sec.totalFilings > 500) {
      score += 5;
      signals.push({
        text: `${sec.totalFilings.toLocaleString()} SEC filing mentions`,
        severity: "low",
        icon: "📊",
      });
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine verdict
  let verdict: string, verdictEmoji: string, verdictColor: string;
  if (score >= 75) {
    verdict = "COMPROMISED";
    verdictEmoji = "🔴";
    verdictColor = "#ff0040";
  } else if (score >= 50) {
    verdict = "SUSPICIOUS";
    verdictEmoji = "🟠";
    verdictColor = "#ff8800";
  } else if (score >= 25) {
    verdict = "PERSON OF INTEREST";
    verdictEmoji = "🟡";
    verdictColor = "#ffcc00";
  } else if (score > 0) {
    verdict = "MOSTLY HARMLESS";
    verdictEmoji = "🟢";
    verdictColor = "#00ff41";
  } else {
    verdict = "CLEAN (for now)";
    verdictEmoji = "✅";
    verdictColor = "#00ff41";
  }

  return { score, signals, verdict, verdictEmoji, verdictColor };
}
