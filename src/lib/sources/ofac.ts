import { OFACResult } from "../types";

export async function searchOFAC(name: string): Promise<OFACResult> {
  try {
    // Try OpenSanctions API (may need auth)
    const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}&limit=5`;
    const headers: Record<string, string> = {
      "User-Agent": "ismyvcaforeignagent/1.0",
    };
    
    // Use API key if available
    if (process.env.OPENSANCTIONS_API_KEY) {
      headers["Authorization"] = `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`;
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 401 || res.status === 403) {
      // No API key — fall back to providing search link
      // Try the free yente demo API instead
      const yenteUrl = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}&limit=5&algorithm=best`;
      const yenteRes = await fetch(yenteUrl, {
        headers: { "User-Agent": "ismyvcaforeignagent/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!yenteRes.ok) {
        return {
          source: "ofac_sanctions",
          hit: false,
          note: "Sanctions search available via direct link. API requires authentication.",
          results: [],
          searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
        };
      }

      const yenteData = await yenteRes.json();
      return processResults(yenteData, name);
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

function processResults(data: Record<string, unknown>, name: string): OFACResult {
  const results = (data.results as Array<Record<string, unknown>>) || [];
  
  // Filter for reasonable matches (score > 0.4)
  const goodMatches = results.filter(r => ((r.score as number) || 0) > 0.4);

  return {
    source: "ofac_sanctions",
    hit: goodMatches.length > 0,
    results: goodMatches.slice(0, 5).map((r) => {
      const props = (r.properties as Record<string, string[]>) || {};
      return {
        name: (r.caption as string) || "Unknown",
        schema: (r.schema as string) || "",
        datasets: (r.datasets as string[]) || [],
        countries: props.country || [],
        topics: props.topics || [],
        score: (r.score as number) || 0,
      };
    }),
    searchUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
  };
}
