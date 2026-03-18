import { FARAResult, FARAMatch } from "../types";
import { readFileSync } from "fs";
import { join } from "path";

// Types matching the compact JSON index
interface RegistrantEntry {
  n: string;
  b: string;
  r: string;
  d: string;
  t: string;
}

interface ShortFormEntry {
  fn: string;
  ln: string;
  r: string;
  rn: string;
  d: string;
  t: string;
}

interface FPEntry {
  fp: string;
  c: string;
  r: string;
  rn: string;
  d: string;
  t: string;
}

interface FARAIndex {
  registrants: RegistrantEntry[];
  shortForms: ShortFormEntry[];
  foreignPrincipals: FPEntry[];
}

// In-memory FARA search index — loaded once
let index: FARAIndex | null = null;

function ensureLoaded() {
  if (!index) {
    try {
      const filePath = join(process.cwd(), "data", "fara-index.json");
      const content = readFileSync(filePath, "utf-8");
      index = JSON.parse(content);
      console.log(
        `FARA loaded: ${index!.registrants.length} registrants, ${index!.shortForms.length} short forms, ${index!.foreignPrincipals.length} foreign principals`
      );
    } catch (e) {
      console.error("Failed to load FARA index:", e);
      index = { registrants: [], shortForms: [], foreignPrincipals: [] };
    }
  }
}

function normalizeForSearch(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = normalizeForSearch(query);
  const t = normalizeForSearch(target);
  
  if (!q || !t) return false;
  
  const queryWords = q.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return false;
  
  const targetWords = t.split(/\s+/);
  
  if (queryWords.length > 1) {
    // Multi-word: each query word must match a target word (prefix ok if >= 3 chars)
    return queryWords.every(qw => 
      targetWords.some(tw => tw === qw || (tw.startsWith(qw) && qw.length >= 3))
    );
  }
  
  // Single word: must be an exact word match
  return targetWords.some(tw => tw === queryWords[0]);
}

export async function searchFARA(name: string): Promise<FARAResult> {
  try {
    ensureLoaded();
    if (!index) throw new Error("FARA index not loaded");
    
    const matches: FARAMatch[] = [];
    
    // Search registrant names
    for (const reg of index.registrants) {
      if (fuzzyMatch(name, reg.n) || fuzzyMatch(name, reg.b)) {
        // Find foreign principals for this registrant
        const fps = index.foreignPrincipals.filter(fp => fp.r === reg.r);
        
        for (const fp of fps.slice(0, 3)) {
          matches.push({
            registrantName: reg.n || reg.b,
            registrationNumber: reg.r,
            foreignPrincipal: fp.fp || "See FARA filing",
            country: fp.c || "See FARA filing",
            registrationDate: reg.d,
            terminationDate: reg.t,
            matchType: "registrant",
          });
        }
        
        if (fps.length === 0) {
          matches.push({
            registrantName: reg.n || reg.b,
            registrationNumber: reg.r,
            foreignPrincipal: "See FARA filing",
            country: "See FARA filing",
            registrationDate: reg.d,
            terminationDate: reg.t,
            matchType: "registrant",
          });
        }
      }
    }
    
    // Search short forms (individual people)
    for (const sf of index.shortForms) {
      const fullName = `${sf.fn} ${sf.ln}`.trim();
      
      if (fuzzyMatch(name, fullName) || fuzzyMatch(name, `${sf.ln} ${sf.fn}`)) {
        const fps = index.foreignPrincipals.filter(fp => fp.r === sf.r);
        
        for (const fp of fps.slice(0, 2)) {
          matches.push({
            registrantName: sf.rn,
            registrationNumber: sf.r,
            foreignPrincipal: fp.fp || "See FARA filing",
            country: fp.c || "See FARA filing",
            registrationDate: sf.d,
            terminationDate: sf.t,
            matchType: "short_form",
            personName: fullName,
          });
        }
        
        if (fps.length === 0) {
          matches.push({
            registrantName: sf.rn,
            registrationNumber: sf.r,
            foreignPrincipal: "See FARA filing",
            country: "See FARA filing",
            registrationDate: sf.d,
            terminationDate: sf.t,
            matchType: "short_form",
            personName: fullName,
          });
        }
      }
    }
    
    // Search foreign principals registrant names
    for (const fp of index.foreignPrincipals) {
      if (fuzzyMatch(name, fp.rn) && !matches.find(m => m.registrantName === fp.rn && m.foreignPrincipal === fp.fp)) {
        matches.push({
          registrantName: fp.rn,
          registrationNumber: fp.r,
          foreignPrincipal: fp.fp,
          country: fp.c,
          registrationDate: fp.d,
          terminationDate: fp.t,
          matchType: "foreign_principal_registrant",
        });
      }
    }
    
    // Deduplicate
    const seen = new Set<string>();
    const dedupedMatches = matches.filter(m => {
      const key = `${m.registrationNumber}:${m.foreignPrincipal}:${m.personName || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      source: "fara",
      hit: dedupedMatches.length > 0,
      matches: dedupedMatches.slice(0, 10),
      searchUrl: `https://efile.fara.gov/ords/fara/f?p=1235:10:::NO::P10_SEARCH:${encodeURIComponent(name)}`,
      disclaimer: "FARA registration is a legal disclosure requirement. Many legitimate lobbyists, lawyers, and PR firms are registered. Registration does not imply wrongdoing.",
    };
  } catch (e) {
    return {
      source: "fara",
      hit: false,
      error: (e as Error).message,
      matches: [],
      searchUrl: `https://efile.fara.gov/ords/fara/f?p=1235:10:::NO::P10_SEARCH:${encodeURIComponent(name)}`,
      disclaimer: "FARA registration is a legal disclosure requirement.",
    };
  }
}
