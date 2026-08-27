import type { BackupPayload, LedgerEntry } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const buffer = (bytes: Uint8Array): ArrayBuffer => bytes.slice().buffer as ArrayBuffer;

async function deriveKey(passphrase: string, salt: Uint8Array, usage: KeyUsage[]) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: buffer(salt), iterations: 310_000 }, material, { name: 'AES-GCM', length: 256 }, false, usage);
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

const base64ToBytes = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function blobToData(blob: Blob) {
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
}

export async function encryptBackup(entries: LedgerEntry[], passphrase: string): Promise<Blob> {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: await Promise.all(entries.map(async ({ receipt, ...entry }) => ({
      ...entry,
      receiptData: receipt ? await blobToData(receipt) : undefined,
      receiptType: receipt?.type
    })))
  };
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: buffer(iv) }, key, encoder.encode(JSON.stringify(payload))));
  return new Blob([JSON.stringify({ format: 'quarter-sheet-backup', version: 1, salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(ciphertext) })], { type: 'application/json' });
}

export async function decryptBackup(file: File, passphrase: string): Promise<LedgerEntry[]> {
  let wrapper: { format?: string; version?: number; salt?: string; iv?: string; data?: string };
  try { wrapper = JSON.parse(await file.text()); } catch { throw new Error('This is not a Quarter sheet backup file.'); }
  if (wrapper.format !== 'quarter-sheet-backup' || wrapper.version !== 1 || !wrapper.salt || !wrapper.iv || !wrapper.data) throw new Error('This backup format is not supported.');
  try {
    const salt = base64ToBytes(wrapper.salt);
    const iv = base64ToBytes(wrapper.iv);
    const key = await deriveKey(passphrase, salt, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buffer(iv) }, key, buffer(base64ToBytes(wrapper.data)));
    const payload = JSON.parse(decoder.decode(plaintext)) as BackupPayload;
    if (payload.version !== 1 || !Array.isArray(payload.entries)) throw new Error('Invalid payload');
    return payload.entries.map(({ receiptData, receiptType, ...entry }) => ({
      ...entry,
      receipt: receiptData ? new Blob([base64ToBytes(receiptData)], { type: receiptType || 'application/octet-stream' }) : undefined
    }));
  } catch { throw new Error('That passphrase did not unlock this backup, or the file is damaged.'); }
}
