import { describe, expect, it } from 'vitest';
import { amountToPence, quartersFor, type LedgerEntry } from '../src/types';
import { toCsv } from '../src/exports';
import { toXlsx } from '../src/xlsx';
import { decryptBackup, encryptBackup } from '../src/backup';

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

describe('encrypted backups', () => {
  it('round-trips records and rejects a wrong passphrase', async () => {
    const backup = await encryptBackup([row], 'a long test passphrase');
    const file = new File([backup], 'test.mtdledger');
    await expect(decryptBackup(file, 'a long test passphrase')).resolves.toEqual([expect.objectContaining({ id: 'one', amountPence: 125050 })]);
    await expect(decryptBackup(file, 'wrong passphrase')).rejects.toThrow('did not unlock');
  });
});
