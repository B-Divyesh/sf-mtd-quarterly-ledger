import { categoryById, type LedgerEntry } from './types';

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function exportRows(entries: LedgerEntry[]) {
  return entries.map((entry) => {
    const category = categoryById(entry.categoryId);
    return [entry.date, entry.type, category?.label ?? entry.categoryId, category?.box ?? '', entry.note, (entry.amountPence / 100).toFixed(2), entry.receipt ? 'yes' : 'no'];
  });
}

export function toCsv(entries: LedgerEntry[]): string {
  const header = ['date', 'type', 'category', 'hmrc_box', 'description', 'amount_gbp', 'receipt_attached'];
  return [header, ...exportRows(entries)].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
