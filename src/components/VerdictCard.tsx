"use client";

import { InvestigationResponse } from "@/lib/types";

interface Props {
  result: InvestigationResponse;
}

export function VerdictCard({ result }: Props) {
  const { spyScore, query } = result;

  let borderClass = "border-[var(--green)]";
  if (spyScore.score >= 75) borderClass = "border-[var(--red)]";
  else if (spyScore.score >= 50) borderClass = "border-[var(--orange)]";
  else if (spyScore.score >= 25) borderClass = "border-[var(--yellow)]";

  let glowClass = "shadow-[0_0_20px_rgba(0,255,65,0.15)]";
  if (spyScore.score >= 75) glowClass = "shadow-[0_0_30px_rgba(255,0,64,0.2)]";
  else if (spyScore.score >= 50) glowClass = "shadow-[0_0_25px_rgba(255,136,0,0.2)]";
  else if (spyScore.score >= 25) glowClass = "shadow-[0_0_20px_rgba(255,204,0,0.15)]";

  return (
    <div
      className={`bg-[var(--bg-card)] border-t-[3px] border-x border-b border-x-[var(--border)] border-b-[var(--border)] ${borderClass} rounded-2xl p-10 text-center relative overflow-hidden ${glowClass} animate-fade-in`}
    >
      {/* Subject line */}
      <div className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-dim)] uppercase tracking-[3px] mb-4">
        SUBJECT: {query}
      </div>

      {/* Emoji */}
      <div className="text-[80px] mb-4">{spyScore.verdictEmoji}</div>

      {/* Verdict text */}
      <div
        className="font-[family-name:var(--font-mono)] font-bold text-[clamp(28px,5vw,42px)] tracking-[4px] mb-3"
        style={{ color: spyScore.verdictColor }}
      >
        {spyScore.verdict}
      </div>

      {/* Score */}
      <div className="inline-flex items-baseline gap-2 mb-6">
        <span
          className="font-[family-name:var(--font-mono)] text-[64px] font-bold leading-none"
          style={{ color: spyScore.verdictColor }}
        >
          {spyScore.score}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-dim)] uppercase tracking-[2px]">
          / 100
          <br />
          spy score
        </span>
      </div>

      {/* Meter */}
      <div className="w-full max-w-[400px] h-2 bg-[var(--border)] rounded mx-auto mb-8 overflow-hidden">
        <div
          className="h-full rounded transition-[width] duration-[1.5s] ease-out"
          style={{
            width: `${spyScore.score}%`,
            background: spyScore.verdictColor,
          }}
        />
      </div>

      {/* Signals */}
      {spyScore.signals.length > 0 ? (
        <div className="flex flex-col gap-2 text-left max-w-[500px] mx-auto">
          {spyScore.signals.map((signal, i) => {
            let signalClass = "border-[var(--text-dim)] bg-[rgba(102,102,102,0.08)] text-[var(--text-dim)]";
            if (signal.severity === "critical")
              signalClass = "border-[var(--red)] bg-[rgba(255,0,64,0.08)] text-[var(--red)]";
            else if (signal.severity === "high")
              signalClass = "border-[var(--orange)] bg-[rgba(255,136,0,0.08)] text-[var(--orange)]";
            else if (signal.severity === "medium")
              signalClass = "border-[var(--yellow)] bg-[rgba(255,204,0,0.08)] text-[var(--yellow)]";

            return (
              <div
                key={i}
                className={`font-[family-name:var(--font-mono)] text-xs py-2 px-3 rounded-md border-l-[3px] ${signalClass}`}
              >
                {signal.icon} {signal.text}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[var(--text-dim)] text-sm">
          No signals detected across searched databases. Either they&apos;re clean or very good at this.
        </p>
      )}

      {/* Share buttons */}
      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/investigate?q=${encodeURIComponent(query)}`;
            const text = `🕵️ ${query}: ${spyScore.score}/100 Spy Score — ${spyScore.verdict}\n\n${shareUrl}`;
            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(tweetUrl, "_blank");
          }}
          className="font-[family-name:var(--font-mono)] text-xs py-2 px-4 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-colors cursor-pointer bg-transparent"
        >
          Share on 𝕏
        </button>
        <button
          onClick={() => {
            const shareUrl = `${window.location.origin}/investigate?q=${encodeURIComponent(query)}`;
            const text = `🕵️ ${query}: ${spyScore.score}/100 Spy Score — ${spyScore.verdict}\n${spyScore.signals.map(s => `${s.icon} ${s.text}`).join("\n")}\n\n${shareUrl}`;
            navigator.clipboard.writeText(text);
            // Brief visual feedback
            const btn = document.activeElement as HTMLButtonElement;
            const orig = btn.textContent;
            btn.textContent = "✓ Copied!";
            setTimeout(() => { btn.textContent = orig; }, 1500);
          }}
          className="font-[family-name:var(--font-mono)] text-xs py-2 px-4 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-colors cursor-pointer bg-transparent"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}
