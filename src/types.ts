export type EntryType = 'income' | 'expense';

export interface Category {
  id: string;
  type: EntryType;
  label: string;
  box: string;
  hint: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: EntryType;
  amountPence: number;
  categoryId: string;
  note: string;
  receipt?: Blob;
  receiptName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  entries: Array<Omit<LedgerEntry, 'receipt'> & { receiptData?: string; receiptType?: string }>;
}

export const categories: Category[] = [
  { id: 'turnover', type: 'income', label: 'Sales and turnover', box: 'SA103F box 15', hint: 'Money earned from your self-employed work.' },
  { id: 'other-income', type: 'income', label: 'Other business income', box: 'SA103F box 16', hint: 'Other receipts not included in turnover.' },
  { id: 'cost-goods', type: 'expense', label: 'Cost of goods', box: 'SA103F box 17', hint: 'Goods bought for resale or materials used.' },
  { id: 'subcontractors', type: 'expense', label: 'Construction subcontractors', box: 'SA103F box 18', hint: 'Payments to subcontractors in the construction industry.' },
  { id: 'staff', type: 'expense', label: 'Staff costs', box: 'SA103F box 19', hint: 'Employee wages, salaries and related costs.' },
  { id: 'travel', type: 'expense', label: 'Travel and vehicles', box: 'SA103F box 20', hint: 'Business travel and vehicle running costs.' },
  { id: 'premises', type: 'expense', label: 'Premises costs', box: 'SA103F box 21', hint: 'Rent, rates, power and business insurance.' },
  { id: 'repairs', type: 'expense', label: 'Repairs and renewals', box: 'SA103F box 22', hint: 'Repairs and maintenance, not capital purchases.' },
  { id: 'admin', type: 'expense', label: 'Phone, office and stationery', box: 'SA103F box 23', hint: 'Phone, internet, postage, stationery and office costs.' },
  { id: 'advertising', type: 'expense', label: 'Advertising and entertainment', box: 'SA103F box 24', hint: 'Advertising and business entertainment costs.' },
  { id: 'interest', type: 'expense', label: 'Interest on bank loans', box: 'SA103F box 25', hint: 'Business loan and overdraft interest.' },
  { id: 'finance', type: 'expense', label: 'Bank and finance charges', box: 'SA103F box 26', hint: 'Bank, card and other finance charges.' },
  { id: 'bad-debts', type: 'expense', label: 'Bad debts', box: 'SA103F box 27', hint: 'Amounts included in turnover that will not be recovered.' },
  { id: 'professional', type: 'expense', label: 'Legal and professional', box: 'SA103F box 28', hint: 'Accountancy, legal and other professional fees.' },
  { id: 'other-expense', type: 'expense', label: 'Other business expenses', box: 'SA103F box 29', hint: 'Allowable business expenses not listed above.' }
];

export const categoryById = (id: string) => categories.find((category) => category.id === id);

export const money = (pence: number) => new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP'
}).format(pence / 100);

export function taxYearFor(date = new Date()): number {
  const year = date.getFullYear();
  const boundary = new Date(year, 3, 6);
  return date >= boundary ? year : year - 1;
}

export interface Quarter {
  number: number;
  label: string;
  start: string;
  end: string;
  due: string;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

export function quartersFor(startYear: number): Quarter[] {
  return [
    { number: 1, label: 'Quarter 1', start: iso(new Date(Date.UTC(startYear, 3, 6))), end: iso(new Date(Date.UTC(startYear, 6, 5))), due: iso(new Date(Date.UTC(startYear, 7, 7))) },
    { number: 2, label: 'Quarter 2', start: iso(new Date(Date.UTC(startYear, 6, 6))), end: iso(new Date(Date.UTC(startYear, 9, 5))), due: iso(new Date(Date.UTC(startYear, 10, 7))) },
    { number: 3, label: 'Quarter 3', start: iso(new Date(Date.UTC(startYear, 9, 6))), end: iso(new Date(Date.UTC(startYear + 1, 0, 5))), due: iso(new Date(Date.UTC(startYear + 1, 1, 7))) },
    { number: 4, label: 'Quarter 4', start: iso(new Date(Date.UTC(startYear + 1, 0, 6))), end: iso(new Date(Date.UTC(startYear + 1, 3, 5))), due: iso(new Date(Date.UTC(startYear + 1, 4, 7))) }
  ];
}

/**
 * Treat dates as calendar dates, rather than relying on the browser's date
 * input constraints. This is deliberately shared by rendering and saving so
 * a scripted or otherwise invalid form submission cannot put a record into a
 * different quarter from the one the user is viewing.
 */
export function dateInQuarter(date: string, quarter: Quarter): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime())
    && parsed.toISOString().slice(0, 10) === date
    && date >= quarter.start
    && date <= quarter.end;
}

export const inQuarter = (entry: LedgerEntry, quarter: Quarter) => dateInQuarter(entry.date, quarter);

export const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${value}T00:00:00Z`));

export const amountToPence = (value: string): number | null => {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const pence = Math.round(Number(value) * 100);
  return Number.isSafeInteger(pence) && pence > 0 ? pence : null;
};
