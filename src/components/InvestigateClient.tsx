"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import { InvestigationResponse } from "@/lib/types";
import { VerdictCard } from "@/components/VerdictCard";
import { SourceCard } from "@/components/SourceCard";
import { LoadingScreen } from "@/components/LoadingScreen";

function InvestigateContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(nameParam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSearched = useRef(false);

  async function investigate(name: string) {
    if (!name.trim() || name.trim().length < 2) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setQuery(name.trim());

    const url = new URL(window.location.href);
    url.searchParams.set("q", name.trim());
    window.history.replaceState({}, "", url.toString());

    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data: InvestigationResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (nameParam && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      investigate(nameParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameParam]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    investigate(query);
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Compact Header */}
      <header className="text-center pt-6 pb-4 px-4">
        <a href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-3xl sm:text-4xl">🕵️</span>
          <h1 className="font-black text-xl sm:text-2xl tracking-[-1px] bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Is My VC a <span className="bg-gradient-to-br from-[var(--accent)] to-[#00cc33] bg-clip-text">Foreign Agent</span>?
          </h1>
          <span className="text-3xl sm:text-4xl">🕵️‍♀️</span>
        </a>
      </header>

      {/* Search — centered with proper constraints */}
      <section className="w-full max-w-[680px] mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all focus-within:border-[var(--accent-dim)] focus-within:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter VC name or firm..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent border-none text-[var(--text)] font-[family-name:var(--font-mono)] text-sm sm:text-base py-3 sm:py-[18px] px-4 sm:px-6 outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[var(--accent)] text-black border-none font-[family-name:var(--font-mono)] font-bold text-xs sm:text-sm py-3 sm:py-[18px] px-4 sm:px-7 cursor-pointer tracking-wider whitespace-nowrap hover:bg-[#33ff66] disabled:bg-[var(--text-muted)] disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {loading ? "SCANNING..." : "INVESTIGATE"}
          </button>
        </form>
      </section>

      {/* Loading */}
      {loading && <LoadingScreen />}

      {/* Error */}
      {error && (
        <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-10">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 sm:p-10 text-center animate-fade-in">
            <p className="text-[var(--red)]">❌ Error: {error}</p>
            <p className="text-[var(--text-dim)] text-sm mt-2">Please try again.</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-8 sm:py-10 animate-fade-in">
          <VerdictCard result={result} />

          <div className="grid gap-4 mt-6 sm:mt-8">
            {result.sources.map((source) => (
              <SourceCard key={source.source} source={source} />
            ))}
          </div>

          <div className="mt-8 sm:mt-10 p-4 sm:p-5 border border-dashed border-[var(--border)] rounded-lg font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)] leading-relaxed">
            <span className="text-[var(--yellow)]">⚠ DISCLAIMER: </span>
            {result.disclaimer}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-12 sm:py-16 px-4 font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)]">
        <p>ismyvcaforeignagent.com · Searches public government databases. Nothing classified. Sadly.</p>
        <p className="mt-2">Built for laughs and light diligence. Not legal advice.</p>
      </footer>
    </main>
  );
}

export default function InvestigateClient() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent)]">
          Loading investigation...
        </div>
      </main>
    }>
      <InvestigateContent />
    </Suspense>
  );
}
