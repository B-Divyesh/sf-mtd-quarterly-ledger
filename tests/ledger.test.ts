import { describe, expect, it, vi } from 'vitest';
import { amountToPence, dateInQuarter, quartersFor, type LedgerEntry } from '../src/types';
import { toCsv } from '../src/exports';
import { toXlsx } from '../src/xlsx';
import { decryptBackup, encryptBackup } from '../src/backup';
import { watchForServiceWorkerUpdate } from '../src/service-worker-update';
import { parseCsv, previewImport } from '../src/import';

const row: LedgerEntry = {
  id: 'one', date: '2026-04-06', type: 'income', amountPence: 125050,
  categoryId: 'turnover', note: 'Invoice "April"', createdAt: '2026-04-06T00:00:00.000Z', updatedAt: '2026-04-06T00:00:00.000Z'
};

describe('tax quarters', () => {
  it('uses the UK 6 April year and official update deadlines', () => {
    expect(quartersFor(2026)).toEqual([
      expect.objectContaining({ start: '2026-04-06', end: '2026-07-05', due: '2026-08-07' }),
      expect.objectContaining({ start: '2026-07-06', end: '2026-10-05', due: '2026-11-07' }),
      expect.objectContaining({ start: '2026-10-06', end: '2027-01-05', due: '2027-02-07' }),
      expect.objectContaining({ start: '2027-01-06', end: '2027-04-05', due: '2027-05-07' })
    ]);
  });

  it('rejects calendar dates outside the selected quarter in application logic', () => {
    const [q1] = quartersFor(2026);
    expect(dateInQuarter('2026-04-06', q1)).toBe(true);
    expect(dateInQuarter('2026-07-05', q1)).toBe(true);
    expect(dateInQuarter('2026-07-06', q1)).toBe(false);
    expect(dateInQuarter('2026-04-05', q1)).toBe(false);
    expect(dateInQuarter('2026-05-99', q1)).toBe(false);
  });
});

describe('PWA updates', () => {
  it('announces a worker that becomes waiting in the current session', () => {
    let onUpdateFound: (() => void) | undefined;
    let onStateChange: (() => void) | undefined;
    const worker = {
      state: 'installing',
      addEventListener: (_name: string, listener: () => void) => { onStateChange = listener; }
    };
    const registration = {
      installing: worker,
      addEventListener: (_name: string, listener: () => void) => { onUpdateFound = listener; }
    };
    const announce = vi.fn();

    watchForServiceWorkerUpdate(registration as unknown as ServiceWorkerRegistration, () => true, announce);
    onUpdateFound?.();
    registration.installing = null as unknown as typeof worker;
    worker.state = 'installed';
    onStateChange?.();

    expect(announce).toHaveBeenCalledTimes(1);
  });
});

describe('amount parsing', () => {
  it('stores exact integer pence and rejects unsafe input', () => {
    expect(amountToPence('48.50')).toBe(4850);
    expect(amountToPence('12.345')).toBeNull();
    expect(amountToPence('-2')).toBeNull();
    expect(amountToPence('anything')).toBeNull();
  });
});

describe('exports', () => {
  it('creates a stable quoted bridging CSV', () => {
    const csv = toCsv([row]);
    expect(csv).toContain('"date","type","category","hmrc_box"');
    expect(csv).toContain('"Invoice ""April"""');
    expect(csv).toContain('"1250.50"');
  });

  it('creates a real zipped XLSX package', async () => {
    const bytes = new Uint8Array(await toXlsx([row]).arrayBuffer());
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('PK');
    expect(bytes.length).toBeGreaterThan(800);
  });
});

describe('CSV import', () => {
  it('parses quoted values and rejects duplicates and dates outside the selected quarter', () => {
    const csv = parseCsv('When,Details,Value,Direction\n2026-07-12,"Invoice, July",45.50,income\n2026-06-01,Outside,5.00,income\n2026-07-12,"Invoice, July",45.50,income');
    const preview = previewImport(csv, { date: 'When', description: 'Details', amount: 'Value', type: 'Direction', fallbackType: 'income', categoryId: 'turnover' }, quartersFor(2026)[1], []);
    expect(preview.accepted).toHaveLength(1);
    expect(preview.accepted[0].note).toBe('Invoice, July');
    expect(preview.duplicates).toBe(1);
    expect(preview.rejected[0]).toContain('date in this quarter');
  });
});

describe('encrypted backups', () => {
  it('round-trips records and rejects a wrong passphrase', async () => {
    const backup = await encryptBackup([row], 'a long test passphrase');
    const file = new File([backup], 'test.mtdledger');
    await expect(decryptBackup(file, 'a long test passphrase')).resolves.toEqual([expect.objectContaining({ id: 'one', amountPence: 125050 })]);
    await expect(decryptBackup(file, 'wrong passphrase')).rejects.toThrow('did not unlock');
  });
});
