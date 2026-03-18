import { FBIResult } from "../types";

export async function searchFBIWanted(name: string): Promise<FBIResult> {
  try {
    // Use the FBI Wanted API — search by title
    // Important: the API matches title containing the search string
    // We need to verify the match quality to avoid false positives
    const url = `https://api.fbi.gov/wanted/v1/list?title=${encodeURIComponent(name)}&pageSize=10&page=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ismyvcaforeignagent/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { source: "fbi_wanted", hit: false, error: `HTTP ${res.status}`, results: [], total: 0 };
    }

    const data = await res.json();
    const items = data.items || [];

    // Filter for actual name matches — the FBI API is very loose
    // It matches on partial words, so "John Smith" matches "JOHN DOE"
    const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    const filteredItems = items.filter((item: Record<string, unknown>) => {
      const title = ((item.title as string) || "").toLowerCase();
      // Require ALL significant name words to appear in the title
      return nameWords.every(word => title.includes(word));
    });

    return {
      source: "fbi_wanted",
      hit: filteredItems.length > 0,
      results: filteredItems.slice(0, 3).map((i: Record<string, unknown>) => ({
        title: i.title as string,
        description: ((i.description as string) || "").slice(0, 300),
        subjects: (i.subjects as string[]) || [],
        warningMessage: (i.warning_message as string) || "",
        url: i.url as string,
        images: ((i.images as Array<Record<string, string>>) || [])
          .slice(0, 1)
          .map((img) => img.thumb),
      })),
      total: filteredItems.length,
    };
  } catch (e) {
    return {
      source: "fbi_wanted",
      hit: false,
      error: (e as Error).message,
      results: [],
      total: 0,
    };
  }
}
