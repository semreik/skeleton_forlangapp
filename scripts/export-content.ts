#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';

const {
  GOOGLE_API_KEY,
  DECKS_SHEET_ID,
  DICTIONARY_SHEET_ID,
  CULTURE_SHEET_ID,
} = process.env;

if (!GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_API_KEY environment variable');
  process.exit(1);
}

interface RowObject {
  [key: string]: string;
}

async function fetchSheet(spreadsheetId: string, range: string): Promise<RowObject[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch range ${range} from sheet ${spreadsheetId}`);
  }
  const data = await res.json();
  const [headers, ...rows] = data.values as string[][];
  return rows.map((row) => {
    const obj: RowObject = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? '';
    });
    return obj;
  });
}

async function writeJSON(relativePath: string, data: unknown) {
  const filePath = path.join(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${relativePath}`);
}

async function run() {
  if (DECKS_SHEET_ID) {
    const decks = await fetchSheet(DECKS_SHEET_ID, 'Sheet1');
    await writeJSON('assets/decks/decks.json', decks);
  }

  if (DICTIONARY_SHEET_ID) {
    const dictionary = await fetchSheet(DICTIONARY_SHEET_ID, 'Sheet1');
    await writeJSON('assets/dictionary/dzardzongke.dict.json', dictionary);
  }

  if (CULTURE_SHEET_ID) {
    const culture = await fetchSheet(CULTURE_SHEET_ID, 'Sheet1');
    await writeJSON('assets/culture/culture.json', culture);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
