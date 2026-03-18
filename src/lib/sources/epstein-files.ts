import { EpsteinResult } from "../types";

export async function searchEpsteinFiles(name: string): Promise<EpsteinResult> {
  try {
    const url = `https://epstein-file-explorer.com/api/search?q=${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ismyvcaforeignagent/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return { source: "epstein_files", hit: false, error: `HTTP ${res.status}`, persons: [], documentCount: 0, rawDocumentHits: [] };
    }

    const data = await res.json();
    const persons = data.persons || [];
    const documents = data.documents || [];

    if (persons.length === 0 && documents.length === 0) {
      return { source: "epstein_files", hit: false, persons: [], documentCount: 0, rawDocumentHits: [] };
    }

    return {
      source: "epstein_files",
      hit: persons.length > 0,
      persons: persons.slice(0, 5).map((p: Record<string, unknown>) => ({
        name: p.name as string,
        aliases: (p.aliases as string[]) || [],
        role: (p.role || p.description) as string,
        description: p.description as string,
        status: p.status as string,
        occupation: p.occupation as string,
        documentCount: (p.documentCount as number) || 0,
        connectionCount: (p.connectionCount as number) || 0,
        category: p.category as string,
        connections: (p.profileSections as Array<{ id: string; content: string }>)
          ?.find((s) => s.id === "connections")
          ?.content?.slice(0, 500) || null,
        wikipediaUrl: (p.wikipediaUrl as string) || null,
      })),
      documentCount: documents.length,
      rawDocumentHits: documents.slice(0, 3).map((d: Record<string, unknown>) => ({
        title: d.title as string,
        description: ((d.description as string) || "").slice(0, 200),
        type: d.documentType as string,
        dataSet: d.dataSet as string,
      })),
    };
  } catch (e) {
    return {
      source: "epstein_files",
      hit: false,
      error: (e as Error).message,
      persons: [],
      documentCount: 0,
      rawDocumentHits: [],
    };
  }
}
