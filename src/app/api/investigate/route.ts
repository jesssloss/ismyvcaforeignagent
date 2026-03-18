import { NextRequest, NextResponse } from "next/server";
import { searchEpsteinFiles } from "@/lib/sources/epstein-files";
import { searchEpsteinInvestigation } from "@/lib/sources/epstein-investigation";
import { searchFARA } from "@/lib/sources/fara";
import { searchFBIWanted } from "@/lib/sources/fbi";
import { searchOFAC } from "@/lib/sources/ofac";
import { searchSEC } from "@/lib/sources/sec";
import { calculateSpyScore } from "@/lib/scoring";
import { InvestigationResponse } from "@/lib/types";
import { getCached, setCache } from "@/lib/cache";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${Math.ceil(rateCheck.resetMs / 1000)}s.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name is required (min 2 characters)" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    // Check cache first
    const cached = getCached(cleanName);
    if (cached) {
      console.log(`🔍 Cache hit: "${cleanName}" → Score: ${cached.spyScore.score}`);
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT" },
      });
    }

    console.log(`🔍 Investigating: "${cleanName}"`);

    // Fan out all searches in parallel
    const [epsteinFiles, epsteinInv, fara, ofac, fbi, sec] = await Promise.all([
      searchEpsteinFiles(cleanName),
      searchEpsteinInvestigation(cleanName),
      searchFARA(cleanName),
      searchOFAC(cleanName),
      searchFBIWanted(cleanName),
      searchSEC(cleanName),
    ]);

    const results = [epsteinFiles, epsteinInv, fara, ofac, fbi, sec];
    const spyScore = calculateSpyScore(results);

    console.log(`  → Score: ${spyScore.score} | Verdict: ${spyScore.verdict}`);

    const response: InvestigationResponse = {
      query: cleanName,
      timestamp: new Date().toISOString(),
      spyScore,
      sources: results,
      disclaimer:
        "This is a satirical research tool. Appearing in government databases does not imply guilt, espionage, or wrongdoing. FARA registration is a legal disclosure requirement. Many innocent people appear in declassified documents as witnesses, contacts, or incidental mentions. Do your own due diligence. Not legal advice.",
    };

    // Cache the result
    setCache(cleanName, response);

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (e) {
    console.error("Investigation error:", e);
    return NextResponse.json(
      { error: "Investigation failed. Please try again." },
      { status: 500 }
    );
  }
}
