import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

type AuditedRow = { text: string; words: number };

function auditedRows() {
  return JSON.parse(execFileSync('node', ['scripts/copy-audit.mjs', '--json'], { encoding: 'utf8' })) as AuditedRow[];
}

describe('copy audit', () => {
  it('checks current source strings before generating the audit', () => {
    expect(() => execFileSync('node', ['scripts/copy-audit.mjs', '--check'], { encoding: 'utf8' })).not.toThrow();
  });

  it('uses the documented whitespace tokenizer for representative current copy', () => {
    const rows = auditedRows();
    expect(rows.find((row) => row.text === 'For UK sole traders keeping Making Tax Digital records without a full accounting suite.')?.words).toBe(14);
    expect(rows.find((row) => row.text === 'Stored in this browser')?.words).toBe(4);
    expect(rows.find((row) => row.text === 'Choose a CSV, check the preview, then add accepted rows to this quarter.')?.words).toBe(13);
    expect(rows.find((row) => row.text === 'Install Quarter sheet and use it offline after the first visit')?.words).toBe(11);
  });
});
