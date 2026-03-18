import { OFACResult } from "../types";

export async function searchOFAC(name: string): Promise<OFACResult> {
  try {
    const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}&limit=5`;
    const headers: Record<string, string> = {
      "User-Agent": "ismyvcaforeignagent/1.0",
    };

    if (process.env.OPENSANCTIONS_API_KEY) {
      headers["Authorization"] = `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`;
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 401 || res.status === 403) {
      return {
        source: "ofac_sanctions",
        hit: false,
        note: "Sanctions search requires API authentication.",
        results: [],
        searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
      };
    }

    if (!res.ok) {
      return {
        source: "ofac_sanctions",
        hit: false,
        error: `HTTP ${res.status}`,
        results: [],
        searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
      };
    }

    const data = await res.json();
    return processResults(data, name);
  } catch (e) {
    return {
      source: "ofac_sanctions",
      hit: false,
      error: (e as Error).message,
      results: [],
      searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
    };
  }
}

// Datasets that indicate real concern (not just Wikipedia)
const NOTABLE_DATASETS = new Set([
  "us_ofac_sdn", "us_ofac_cons", // US Treasury sanctions
  "eu_fsf", "eu_cor_members", // EU sanctions
  "un_sc_sanctions", // UN sanctions
  "interpol_red_notices", // Interpol
  "us_cftc_enforcement_actions", // CFTC enforcement
  "us_bis_denied", // Commerce Dept denied persons
  "wd_oligarchs", // Known oligarchs
  "wd_peps", // Politically exposed persons
  "gb_hmt_sanctions", // UK sanctions
  "au_dfat_sanctions", // Australia sanctions
  "ca_sema_sanctions", // Canada sanctions
  "us_cia_world_leaders", // World leaders list
  "us_fbi_most_wanted", // FBI
]);

function isNotableDataset(ds: string): boolean {
  return NOTABLE_DATASETS.has(ds) || 
    ds.includes("sanction") || 
    ds.includes("wanted") || 
    ds.includes("enforcement") ||
    ds.includes("oligarch") ||
    ds.includes("denied") ||
    ds.includes("blocked");
}

function processResults(data: Record<string, unknown>, name: string): OFACResult {
  const rawResults = (data.results as Array<Record<string, unknown>>) || [];

  // Filter: must match reasonably (caption should contain query words)
  const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const filteredResults = rawResults.filter(r => {
    const caption = ((r.caption as string) || "").toLowerCase();
    return nameWords.every(w => caption.includes(w));
  });

  const results = filteredResults.slice(0, 5).map((r) => {
    const props = (r.properties as Record<string, string[]>) || {};
    const datasets = (r.datasets as string[]) || [];
    const topics = props.topics || [];
    const countries = props.country || [];
    const notes = props.notes || [];

    // Calculate a relevance score based on dataset importance
    const notableCount = datasets.filter(isNotableDataset).length;
    const score = Math.min(notableCount / 3, 1); // 0-1 based on notable datasets

    return {
      name: (r.caption as string) || "Unknown",
      schema: (r.schema as string) || "",
      datasets,
      countries,
      topics,
      score,
      notes: notes.slice(0, 3),
    };
  });

  // It's a "hit" if we have results with notable datasets
  const hasNotable = results.some(r => r.datasets.some(isNotableDataset));

  return {
    source: "ofac_sanctions",
    hit: hasNotable || results.length > 0,
    results: results.map(r => ({
      name: r.name,
      schema: r.schema,
      datasets: r.datasets,
      countries: r.countries,
      topics: r.topics,
      score: r.score,
    })),
    searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
  };
}
