"use client";

import {
  SourceResult,
  EpsteinResult,
  EpsteinInvestigationResult,
  FARAResult,
  OFACResult,
  FBIResult,
  SECResult,
} from "@/lib/types";

const SOURCE_NAMES: Record<string, string> = {
  epstein_files: "📁 Epstein Document Archive",
  epstein_investigation: "✈️ Epstein Flight Logs & Investigation",
  fara: "🌐 FARA Foreign Agent Registry",
  ofac_sanctions: "🚫 OFAC / Sanctions Watchlists",
  fbi_wanted: "🔍 FBI Wanted List",
  sec_enforcement: "📊 SEC EDGAR Filings",
};

interface Props {
  source: SourceResult;
}

export function SourceCard({ source }: Props) {
  const statusClass = source.error
    ? "bg-[rgba(102,102,102,0.1)] text-[var(--text-muted)] border-[var(--border)]"
    : source.hit
      ? "bg-[rgba(255,0,64,0.15)] text-[var(--red)] border-[rgba(255,0,64,0.3)]"
      : "bg-[rgba(0,255,65,0.1)] text-[var(--accent)] border-[rgba(0,255,65,0.2)]";

  const statusText = source.error ? "ERROR" : source.hit ? "HIT" : "CLEAR";

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 transition-colors hover:border-[var(--border-glow)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[2px] text-[var(--text-dim)]">
          {SOURCE_NAMES[source.source] || source.source}
        </span>
        <span
          className={`font-[family-name:var(--font-mono)] text-[11px] py-0.5 px-2 rounded font-bold border ${statusClass}`}
        >
          {statusText}
        </span>
      </div>

      {/* Source-specific detail */}
      <div className="text-sm text-[var(--text-dim)] leading-relaxed">
        {renderSourceDetail(source)}
      </div>

      {source.error && (
        <p className="text-[var(--text-muted)] text-[11px] mt-2">Error: {source.error}</p>
      )}
    </div>
  );
}

function renderSourceDetail(source: SourceResult) {
  switch (source.source) {
    case "epstein_files":
      return <EpsteinDetail source={source} />;
    case "epstein_investigation":
      return <EpsteinInvDetail source={source} />;
    case "fara":
      return <FARADetail source={source} />;
    case "ofac_sanctions":
      return <OFACDetail source={source} />;
    case "fbi_wanted":
      return <FBIDetail source={source} />;
    case "sec_enforcement":
      return <SECDetail source={source} />;
    default:
      return <p>Unknown source</p>;
  }
}

function EpsteinDetail({ source }: { source: EpsteinResult }) {
  if (!source.hit || !source.persons?.length) {
    return <p>No persons or documents found matching this name.</p>;
  }

  return (
    <div>
      {source.persons.map((p, i) => (
        <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-lg p-4 mt-3">
          <div className="font-bold text-[15px] text-[var(--text)]">{p.name}</div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-dim)]">
            {p.occupation} · {p.category}
          </div>
          {p.description && (
            <div className="text-[13px] text-[var(--text-dim)] mt-2 leading-normal">
              {p.description}
            </div>
          )}
          <div className="flex gap-4 mt-2.5 flex-wrap">
            <div className="font-[family-name:var(--font-mono)] text-[11px]">
              <span className="text-[var(--accent)] font-bold">{p.documentCount}</span>{" "}
              <span className="text-[var(--text-muted)]">documents</span>
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[11px]">
              <span className="text-[var(--accent)] font-bold">{p.connectionCount}</span>{" "}
              <span className="text-[var(--text-muted)]">connections</span>
            </div>
          </div>
          {p.connections && (
            <div className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--text-dim)] mt-2 leading-relaxed">
              {p.connections}
            </div>
          )}
          {p.wikipediaUrl && (
            <div className="mt-2">
              <a
                href={p.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] text-xs hover:underline"
              >
                Wikipedia →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EpsteinInvDetail({ source }: { source: EpsteinInvestigationResult }) {
  if (!source.hit) {
    return <p>Not found in Epstein investigation entity database or flight logs.</p>;
  }

  return (
    <div>
      {source.entities.map((e, i) => (
        <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-lg p-4 mt-3">
          <div className="font-bold text-[15px] text-[var(--text)]">{e.name}</div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-dim)]">
            {e.roleDescription}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {e.documentCount > 0 && (
              <div className="font-[family-name:var(--font-mono)] text-[11px]">
                <span className="text-[var(--accent)] font-bold">{e.documentCount}</span>{" "}
                <span className="text-[var(--text-muted)]">documents</span>
              </div>
            )}
            {e.flightCount > 0 && (
              <div className="font-[family-name:var(--font-mono)] text-[11px]">
                <span className="text-[var(--red)] font-bold">{e.flightCount}</span>{" "}
                <span className="text-[var(--text-muted)]">flights</span>
              </div>
            )}
            {e.emailCount > 0 && (
              <div className="font-[family-name:var(--font-mono)] text-[11px]">
                <span className="text-[var(--orange)] font-bold">{e.emailCount}</span>{" "}
                <span className="text-[var(--text-muted)]">emails</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {source.flights.length > 0 && (
        <div className="mt-4">
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--red)] font-bold uppercase tracking-wider mb-2">
            ✈️ Flight Logs ({source.totalFlights} total)
          </div>
          {source.flights.map((f, i) => (
            <div
              key={i}
              className="bg-[rgba(255,0,64,0.05)] border border-[rgba(255,0,64,0.15)] rounded-lg p-3 mt-2 font-[family-name:var(--font-mono)] text-[11px]"
            >
              <div className="text-[var(--text)]">
                <span className="text-[var(--red)]">{f.flightDate}</span> ·{" "}
                {f.departure} → {f.arrival}
              </div>
              <div className="text-[var(--text-muted)] mt-1">
                Passengers: {f.passengers.join(", ")}
              </div>
              <div className="text-[var(--text-muted)]">
                Aircraft: {f.tailNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FARADetail({ source }: { source: FARAResult }) {
  if (!source.hit || !source.matches?.length) {
    return (
      <div>
        <p>No match found in FARA foreign agent registry.</p>
        <p className="mt-2">
          <a href={source.searchUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
            Search FARA directly →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {source.matches.map((m, i) => (
        <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-lg p-4 mt-3">
          {m.personName && (
            <div className="font-bold text-[15px] text-[var(--text)]">{m.personName}</div>
          )}
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-dim)]">
            Registrant: {m.registrantName}
          </div>
          <div className="mt-2 font-[family-name:var(--font-mono)] text-[11px]">
            <span className="text-[var(--red)]">Foreign Principal:</span>{" "}
            <span className="text-[var(--text)]">{m.foreignPrincipal}</span>
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[11px]">
            <span className="text-[var(--orange)]">Country:</span>{" "}
            <span className="text-[var(--text)]">{m.country}</span>
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)] mt-1">
            Registered: {m.registrationDate}
            {m.terminationDate ? ` · Terminated: ${m.terminationDate}` : " · ACTIVE"}
          </div>
        </div>
      ))}
      <p className="mt-3 text-[11px] text-[var(--text-muted)]">{source.disclaimer}</p>
      <p className="mt-2">
        <a href={source.searchUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-xs hover:underline">
          Search FARA directly →
        </a>
      </p>
    </div>
  );
}

function OFACDetail({ source }: { source: OFACResult }) {
  if (!source.hit || !source.results?.length) {
    return (
      <div>
        <p>{source.note || "No matches found on sanctions or watchlists."}</p>
        <p className="mt-2">
          <a href={source.searchUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
            Search OpenSanctions →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {source.results.map((r, i) => (
        <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-lg p-4 mt-3">
          <div className="font-bold text-[15px] text-[var(--text)]">{r.name}</div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-dim)]">
            {r.schema} · Match: {Math.round(r.score * 100)}%
          </div>
          {r.datasets.length > 0 && (
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)] mt-1">
              Datasets: {r.datasets.join(", ")}
            </div>
          )}
          {r.countries.length > 0 && (
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)]">
              Countries: {r.countries.join(", ")}
            </div>
          )}
        </div>
      ))}
      <p className="mt-3">
        <a href={source.searchUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] text-xs hover:underline">
          Search OpenSanctions →
        </a>
      </p>
    </div>
  );
}

function FBIDetail({ source }: { source: FBIResult }) {
  if (!source.hit || !source.results?.length) {
    return <p>Not on FBI wanted list. {source.total === 0 ? "No matches." : ""}</p>;
  }

  return (
    <div>
      {source.results.map((r, i) => (
        <div key={i} className="bg-[rgba(255,0,64,0.05)] border border-[rgba(255,0,64,0.15)] rounded-lg p-4 mt-3">
          <div className="font-bold text-[15px] text-[var(--red)]">{r.title}</div>
          <div className="text-[13px] text-[var(--text-dim)] mt-2">{r.description}</div>
          {r.warningMessage && (
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--red)] mt-2">
              ⚠️ {r.warningMessage}
            </div>
          )}
          {r.url && (
            <div className="mt-2">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] text-xs hover:underline"
              >
                FBI page →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SECDetail({ source }: { source: SECResult }) {
  return (
    <div>
      {source.totalFilings > 0 ? (
        <>
          <p>
            <strong className="text-[var(--text)]">{source.totalFilings.toLocaleString()}</strong> SEC filing mentions found.
          </p>
          {source.topFilings.length > 0 && (
            <div className="mt-3">
              {source.topFilings.slice(0, 3).map((f, i) => (
                <div key={i} className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)] mt-1">
                  {f.fileDate} · {f.forms.join(", ")} · {f.entity}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>No SEC filing mentions found.</p>
      )}
      <p className="mt-2">
        <a
          href={source.searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] text-xs hover:underline"
        >
          Search SEC EDGAR →
        </a>
      </p>
    </div>
  );
}
