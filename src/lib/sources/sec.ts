import { SECResult } from "../types";

export async function searchSEC(name: string): Promise<SECResult> {
  try {
    // SEC EDGAR full-text search (EFTS)
    // Search for exact name in all filings
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&from=0&size=5`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ismyvcaforeignagent admin@ismyvcaforeignagent.com",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return {
        source: "sec_enforcement",
        hit: false,
        error: `HTTP ${res.status}`,
        totalFilings: 0,
        topFilings: [],
        searchUrl: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22`,
      };
    }

    const data = await res.json();
    const total = data.hits?.total?.value || 0;
    const hits = data.hits?.hits || [];

    // Also search specifically for enforcement-related forms
    // LIT-REL = Litigation Releases, AAER = Accounting and Auditing Enforcement Releases
    let enforcementTotal = 0;
    try {
      const enfUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&forms=LIT-REL,AAER&from=0&size=3`;
      const enfRes = await fetch(enfUrl, {
        headers: {
          "User-Agent": "ismyvcaforeignagent admin@ismyvcaforeignagent.com",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (enfRes.ok) {
        const enfData = await enfRes.json();
        enforcementTotal = enfData.hits?.total?.value || 0;
      }
    } catch {
      // Ignore enforcement-specific search failure
    }

    return {
      source: "sec_enforcement",
      hit: enforcementTotal > 0 || total > 500, // Only "hit" if enforcement filings or very significant mention volume
      totalFilings: total,
      topFilings: hits.slice(0, 5).map((h: Record<string, unknown>) => {
        const src = h._source as Record<string, unknown>;
        return {
          forms: (src.root_forms as string[]) || [],
          entity: ((src.display_names as string[]) || ["Unknown"])[0],
          fileDate: (src.file_date as string) || "",
        };
      }),
      searchUrl: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22`,
    };
  } catch (e) {
    return {
      source: "sec_enforcement",
      hit: false,
      error: (e as Error).message,
      totalFilings: 0,
      topFilings: [],
      searchUrl: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22`,
    };
  }
}
