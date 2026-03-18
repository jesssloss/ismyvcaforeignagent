"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

const SUGGESTED_NAMES = [
  "Reid Hoffman",
  "Peter Thiel",
  "Marc Andreessen",
  "Bill Gates",
  "Yuri Milner",
  "Masayoshi Son",
  "Sam Bankman-Fried",
  "Elizabeth Holmes",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function goInvestigate(name: string) {
    if (!name.trim() || name.trim().length < 2) return;
    router.push(`/investigate?q=${encodeURIComponent(name.trim())}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goInvestigate(query);
  }

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
        <div className="font-[family-name:var(--font-mono)] text-[11px] tracking-[6px] text-[var(--red)] mb-6 sm:mb-7 animate-blink">
          ◈ CLASSIFIED ◈
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-5">
          <span className="text-4xl sm:text-6xl drop-shadow-[0_0_20px_rgba(0,255,65,0.3)] shrink-0">🕵️</span>
          <div>
            <h1 className="font-black text-[clamp(28px,6vw,56px)] leading-[1.1] tracking-[-2px] bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent text-center">
              Is My VC a<br />
              <span className="bg-gradient-to-br from-[var(--accent)] to-[#00cc33] bg-clip-text">
                Foreign Agent
              </span>
              ?
            </h1>
          </div>
          <span className="text-4xl sm:text-6xl drop-shadow-[0_0_20px_rgba(0,255,65,0.3)] shrink-0">🕵️‍♀️</span>
        </div>

        <p className="font-[family-name:var(--font-mono)] text-xs sm:text-sm text-[var(--text-dim)] leading-relaxed text-center mb-8 sm:mb-10 max-w-[500px]">
          Search public government databases to see if your investor is actually
          a foreign agent blessed with <strong className="text-[var(--accent)]">pristine LP capital</strong> to steal your tech.
        </p>

        {/* Search */}
        <div className="w-full max-w-[680px]">
          <form onSubmit={handleSubmit} className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all focus-within:border-[var(--accent-dim)] focus-within:shadow-[0_0_30px_rgba(0,255,65,0.1)]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter VC name or firm..."
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className="flex-1 min-w-0 bg-transparent border-none text-[var(--text)] font-[family-name:var(--font-mono)] text-sm sm:text-base py-3 sm:py-[18px] px-4 sm:px-6 outline-none placeholder:text-[var(--text-muted)]"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="bg-[var(--accent)] text-black border-none font-[family-name:var(--font-mono)] font-bold text-xs sm:text-sm py-3 sm:py-[18px] px-4 sm:px-7 cursor-pointer tracking-wider whitespace-nowrap hover:bg-[#33ff66] disabled:bg-[var(--text-muted)] disabled:cursor-not-allowed transition-colors shrink-0"
            >
              INVESTIGATE
            </button>
          </form>

          {/* Source badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-4 sm:mt-5">
            {["Epstein Files", "Flight Logs", "FARA Registry", "OFAC Sanctions", "FBI Wanted", "SEC EDGAR"].map(
              (source) => (
                <span
                  key={source}
                  className="font-[family-name:var(--font-mono)] text-[9px] sm:text-[10px] tracking-wider py-0.5 sm:py-1 px-2 sm:px-2.5 border border-[var(--border)] rounded text-[var(--text-dim)] uppercase"
                >
                  {source}
                </span>
              )
            )}
          </div>

          {/* Suggested names */}
          <div className="text-center mt-6 sm:mt-8">
            <div className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-muted)] uppercase tracking-[2px] mb-2.5">
              Try these
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              {SUGGESTED_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => goInvestigate(name)}
                  className="font-[family-name:var(--font-mono)] text-[11px] sm:text-xs text-[var(--text-dim)] bg-[var(--bg-card)] border border-[var(--border)] rounded-md py-1 sm:py-1.5 px-2 sm:px-3 cursor-pointer transition-all hover:border-[var(--accent-dim)] hover:text-[var(--accent)]"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 sm:py-10 px-4 font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)]">
        <p>ismyvcaforeignagent.com · Searches public government databases. Nothing classified. Sadly.</p>
        <p className="mt-2">
          Built for laughs and light diligence. Not legal advice.
        </p>
      </footer>
    </main>
  );
}
