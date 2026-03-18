"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "ACCESSING CLASSIFIED DATABASES...",
  "SCANNING EPSTEIN FLIGHT LOGS...",
  "QUERYING FARA FOREIGN AGENT REGISTRY...",
  "CHECKING OFAC SANCTIONS LIST...",
  "SEARCHING FBI WANTED DATABASE...",
  "CROSS-REFERENCING SEC ENFORCEMENT...",
  "ANALYZING INTELLIGENCE SIGNALS...",
  "COMPUTING SPY SCORE...",
];

const SOURCES = [
  { id: "epstein", label: "Epstein Document Archive (DOJ)" },
  { id: "epstein_inv", label: "Epstein Flight Logs" },
  { id: "fara", label: "FARA Foreign Agent Registry" },
  { id: "ofac", label: "OFAC/OpenSanctions Watchlists" },
  { id: "fbi", label: "FBI Wanted List" },
  { id: "sec", label: "SEC EDGAR Filings" },
];

export function LoadingScreen() {
  const [messageIdx, setMessageIdx] = useState(0);
  const [completedSources, setCompletedSources] = useState<Set<string>>(new Set());
  const [visibleSources, setVisibleSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cycle loading messages
    const msgInterval = setInterval(() => {
      setMessageIdx((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 500);

    // Show sources one by one
    SOURCES.forEach((src, i) => {
      setTimeout(() => {
        setVisibleSources((prev) => new Set([...prev, src.id]));
      }, i * 400);

      setTimeout(() => {
        setCompletedSources((prev) => new Set([...prev, src.id]));
      }, i * 400 + 800 + Math.random() * 1500);
    });

    return () => clearInterval(msgInterval);
  }, []);

  return (
    <div className="text-center py-16 px-5">
      <div className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent)] animate-pulse-slow">
        {LOADING_MESSAGES[messageIdx]}
      </div>

      <div className="w-[300px] max-w-[80%] h-0.5 bg-[var(--border)] mx-auto mt-5 rounded overflow-hidden">
        <div className="h-full bg-[var(--accent)] animate-load-progress" />
      </div>

      <div className="mt-5 flex flex-col items-center gap-1.5">
        {SOURCES.map((src) => (
          <div
            key={src.id}
            className={`font-[family-name:var(--font-mono)] text-[11px] transition-all duration-300 ${
              !visibleSources.has(src.id)
                ? "opacity-0"
                : completedSources.has(src.id)
                  ? "text-[var(--accent)] opacity-100"
                  : "text-[var(--text-muted)] opacity-100"
            }`}
          >
            {completedSources.has(src.id) ? "✓ " : ""}
            {completedSources.has(src.id) ? src.label : `Querying ${src.label}...`}
          </div>
        ))}
      </div>
    </div>
  );
}
