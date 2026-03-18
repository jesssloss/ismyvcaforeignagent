# 🕵️ Is My VC a Foreign Agent?

A satirical research tool that searches public government databases to investigate whether your VC might be a foreign agent. Enter any name and get a **Spy Score** based on hits across multiple intelligence databases.

**Live at: [ismyvcaforeignagent.com](https://ismyvcaforeignagent.com)**

## Data Sources

| Source | What It Searches | API |
|--------|-----------------|-----|
| 📁 Epstein File Explorer | 3,900+ indexed persons from DOJ Epstein documents | epstein-file-explorer.com |
| ✈️ Epstein Investigation | Flight logs (Lolita Express), entity profiles | epsteininvestigation.org |
| 🌐 FARA Registry | 44K+ registered foreign agents (searchable offline) | Bulk CSV from efile.fara.gov |
| 🚫 OFAC/OpenSanctions | Sanctions lists, PEPs, watchlists | api.opensanctions.org |
| 🔍 FBI Wanted | FBI's most wanted and fugitives | api.fbi.gov |
| 📊 SEC EDGAR | SEC filing mentions and enforcement actions | efts.sec.gov |

All data is from **public, free APIs and government databases**. Nothing classified (sadly).

## Spy Score

The Spy Score (0-100) is calculated by weighting hits across sources:

- **✈️ Epstein flight logs**: Heavy weight (you literally flew on the plane)
- **🌐 FARA registration**: Heavy weight (literally registered as a foreign agent)
- **🚫 Sanctions/watchlist match**: Heavy weight
- **🔍 FBI Wanted**: Maximum weight
- **📁 Epstein documents**: Scaled by document count and connections
- **📊 SEC filings**: Low weight (common for anyone in business)

## Development

```bash
npm install
npm run dev
```

### Rebuilding FARA Index

The FARA data is pre-compiled into `data/fara-index.json`. To refresh:

```bash
# Download fresh FARA CSVs
curl -sL "https://efile.fara.gov/bulk/zip/FARA_All_Registrants.csv.zip" -o data/fara_registrants.zip
curl -sL "https://efile.fara.gov/bulk/zip/FARA_All_ForeignPrincipals.csv.zip" -o data/fara_fp.zip
curl -sL "https://efile.fara.gov/bulk/zip/FARA_All_ShortForms.csv.zip" -o data/fara_sf.zip

# Unzip
cd data && unzip -o fara_registrants.zip && unzip -o fara_fp.zip && unzip -o fara_sf.zip && cd ..

# Build index
npx tsx scripts/build-fara-index.ts
```

## Disclaimer

This is a satirical research tool. Appearing in government databases does not imply guilt, espionage, or wrongdoing. FARA registration is a legal disclosure requirement. Many innocent people appear in declassified documents as witnesses, contacts, or incidental mentions. Do your own due diligence. Not legal advice.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Vercel (deployment)
