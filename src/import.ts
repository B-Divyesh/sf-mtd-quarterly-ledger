import { amountToPence, categoryById, dateInQuarter, type EntryType, type LedgerEntry, type Quarter } from './types';

export interface CsvRows { headers: string[]; rows: string[][]; }
export interface ImportMapping {
  date: string;
  description: string;
  amount: string;
  type: string;
  fallbackType: EntryType;
  categoryId: string;
}
export interface ImportPreview { accepted: LedgerEntry[]; duplicates: number; rejected: string[]; }

/** Parse RFC 4180-style CSV locally, including quoted commas and newlines. */
export function parseCsv(text: string): CsvRows {
  const rows: string[][] = [];
  let row: string[] = [], value = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(value); value = ''; }
    else if (char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = ''; }
    else value += char;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row); }
  const [headers = [], ...data] = rows.filter((cells) => cells.some((cell) => cell.trim()));
  return { headers: headers.map((header) => header.trim()), rows: data };
}

export function suggestedColumn(headers: string[], kind: 'date' | 'description' | 'amount' | 'type') {
  const words: Record<typeof kind, string[]> = {
    date: ['date', 'transaction date'],
    description: ['description', 'note', 'details', 'reference', 'payee'],
    amount: ['amount', 'value', 'total'],
    type: ['type', 'income expense', 'transaction type', 'in out']
  };
  return headers.find((header) => words[kind].includes(header.toLowerCase().trim())) || headers[0] || '';
}

function rowValue(headers: string[], row: string[], header: string) { return row[headers.indexOf(header)]?.trim() || ''; }
function importedType(value: string, amount: string, fallback: EntryType): EntryType | null {
  const normalized = value.toLowerCase().trim();
  if (/^(income|in|credit|sale|sales)$/.test(normalized)) return 'income';
  if (/^(expense|out|debit|cost|purchase)$/.test(normalized)) return 'expense';
  if (!normalized && /^-/.test(amount.trim())) return 'expense';
  return !normalized ? fallback : null;
}

export function previewImport(csv: CsvRows, mapping: ImportMapping, quarter: Quarter, existing: LedgerEntry[]): ImportPreview {
  const accepted: LedgerEntry[] = [], rejected: string[] = [];
  const seen = new Set(existing.map((entry) => `${entry.date}|${entry.type}|${entry.amountPence}|${entry.note.trim().toLowerCase()}`));
  let duplicates = 0;
  csv.rows.forEach((row, index) => {
    const date = rowValue(csv.headers, row, mapping.date);
    const note = rowValue(csv.headers, row, mapping.description);
    const amountText = rowValue(csv.headers, row, mapping.amount);
    const type = importedType(rowValue(csv.headers, row, mapping.type), amountText, mapping.fallbackType);
    const amountPence = amountToPence(amountText.replace(/[£,]/g, '').replace(/^-/, ''));
    if (!dateInQuarter(date, quarter)) { rejected.push(`Row ${index + 2}: choose a date in this quarter.`); return; }
    if (!amountPence) { rejected.push(`Row ${index + 2}: enter a positive amount with no more than two decimals.`); return; }
    if (!type) { rejected.push(`Row ${index + 2}: use income or expense in the type column.`); return; }
    if (!categoryById(mapping.categoryId) || categoryById(mapping.categoryId)?.type !== type) { rejected.push(`Row ${index + 2}: choose a ${type} category.`); return; }
    const key = `${date}|${type}|${amountPence}|${note.toLowerCase()}`;
    if (seen.has(key)) { duplicates += 1; return; }
    seen.add(key);
    const now = new Date().toISOString();
    accepted.push({ id: crypto.randomUUID(), date, type, amountPence, categoryId: mapping.categoryId, note, createdAt: now, updatedAt: now });
  });
  return { accepted, duplicates, rejected };
}
