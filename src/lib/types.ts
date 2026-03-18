// ── Source result types ──────────────────────────────────────────

export interface EpsteinPerson {
  name: string;
  aliases: string[];
  role: string;
  description: string;
  status: string;
  occupation: string;
  documentCount: number;
  connectionCount: number;
  category: string;
  connections: string | null;
  wikipediaUrl: string | null;
}

export interface EpsteinResult {
  source: "epstein_files";
  hit: boolean;
  error?: string;
  persons: EpsteinPerson[];
  documentCount: number;
  rawDocumentHits: {
    title: string;
    description: string;
    type: string;
    dataSet: string;
  }[];
}

export interface EpsteinInvestigationEntity {
  name: string;
  slug: string;
  entityType: string;
  documentCount: number;
  flightCount: number;
  emailCount: number;
  roleDescription: string;
}

export interface EpsteinFlight {
  flightDate: string;
  departure: string;
  arrival: string;
  passengers: string[];
  tailNumber: string;
}

export interface EpsteinInvestigationResult {
  source: "epstein_investigation";
  hit: boolean;
  error?: string;
  entities: EpsteinInvestigationEntity[];
  flights: EpsteinFlight[];
  totalFlights: number;
}

export interface FARAMatch {
  registrantName: string;
  registrationNumber: string;
  foreignPrincipal: string;
  country: string;
  registrationDate: string;
  terminationDate: string;
  matchType: "registrant" | "short_form" | "foreign_principal_registrant";
  personName?: string;
}

export interface FARAResult {
  source: "fara";
  hit: boolean;
  error?: string;
  matches: FARAMatch[];
  searchUrl: string;
  disclaimer: string;
}

export interface SanctionsMatch {
  name: string;
  schema: string;
  datasets: string[];
  countries: string[];
  topics: string[];
  score: number;
}

export interface OFACResult {
  source: "ofac_sanctions";
  hit: boolean;
  error?: string;
  results: SanctionsMatch[];
  searchUrl: string;
  note?: string;
}

export interface FBIWantedPerson {
  title: string;
  description: string;
  subjects: string[];
  warningMessage: string;
  url: string;
  images: string[];
}

export interface FBIResult {
  source: "fbi_wanted";
  hit: boolean;
  error?: string;
  results: FBIWantedPerson[];
  total: number;
}

export interface SECResult {
  source: "sec_enforcement";
  hit: boolean;
  error?: string;
  totalFilings: number;
  topFilings: {
    forms: string[];
    entity: string;
    fileDate: string;
  }[];
  searchUrl: string;
}

export type SourceResult =
  | EpsteinResult
  | EpsteinInvestigationResult
  | FARAResult
  | OFACResult
  | FBIResult
  | SECResult;

// ── Spy Score ──────────────────────────────────────────────────

export interface Signal {
  text: string;
  severity: "critical" | "high" | "medium" | "low";
  icon: string;
}

export interface SpyScore {
  score: number;
  signals: Signal[];
  verdict: string;
  verdictEmoji: string;
  verdictColor: string;
}

export interface InvestigationResponse {
  query: string;
  timestamp: string;
  spyScore: SpyScore;
  sources: SourceResult[];
  disclaimer: string;
}
