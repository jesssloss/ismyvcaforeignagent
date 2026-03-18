/**
 * Build a compact JSON index from FARA CSV files for fast serverless search.
 * Run: npx tsx scripts/build-fara-index.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function loadCSV(filename: string): string[][] {
  const filePath = join(process.cwd(), "data", filename);
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  return lines.slice(1).map(parseCSVLine);
}

console.log("Loading FARA CSVs...");

const registrants = loadCSV("FARA_All_Registrants.csv");
const shortForms = loadCSV("FARA_All_ShortForms.csv");
const foreignPrincipals = loadCSV("FARA_All_ForeignPrincipals.csv");

console.log(`Registrants: ${registrants.length}`);
console.log(`Short Forms: ${shortForms.length}`);
console.log(`Foreign Principals: ${foreignPrincipals.length}`);

// Build a compact index
// For each registrant: { regNum, name, bizName, regDate, termDate }
interface RegistrantEntry {
  n: string;   // name
  b: string;   // business name
  r: string;   // registration number
  d: string;   // registration date
  t: string;   // termination date
}

interface ShortFormEntry {
  fn: string;  // first name
  ln: string;  // last name
  r: string;   // registration number
  rn: string;  // registrant name
  d: string;   // registration date
  t: string;   // termination date
}

interface FPEntry {
  fp: string;  // foreign principal name
  c: string;   // country
  r: string;   // registration number
  rn: string;  // registrant name
  d: string;   // registration date
  t: string;   // termination date
}

const registrantIndex: RegistrantEntry[] = registrants.map(row => ({
  n: row[3] || "",
  b: row[4] || "",
  r: row[0] || "",
  d: row[1] || "",
  t: row[2] || "",
}));

const shortFormIndex: ShortFormEntry[] = shortForms
  .filter(row => row.length >= 7)
  .map(row => ({
    fn: row[3] || "",
    ln: row[2] || "",
    r: row[4] || "",
    rn: row[6] || "",
    d: row[5] || "",
    t: row[0] || "",
  }));

const fpIndex: FPEntry[] = foreignPrincipals
  .filter(row => row.length >= 7)
  .map(row => ({
    fp: row[1] || "",
    c: row[3] || "",
    r: row[4] || "",
    rn: row[6] || "",
    d: row[5] || "",
    t: row[0] || "",
  }));

const index = {
  registrants: registrantIndex,
  shortForms: shortFormIndex,
  foreignPrincipals: fpIndex,
  meta: {
    built: new Date().toISOString(),
    registrantCount: registrantIndex.length,
    shortFormCount: shortFormIndex.length,
    fpCount: fpIndex.length,
  },
};

const outputPath = join(process.cwd(), "data", "fara-index.json");
writeFileSync(outputPath, JSON.stringify(index));

const stats = readFileSync(outputPath);
console.log(`\nOutput: ${outputPath}`);
console.log(`Size: ${(stats.length / 1024 / 1024).toFixed(2)} MB`);
