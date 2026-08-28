import './style.css';
import { decryptBackup, encryptBackup } from './backup';
import { clearEntries, deleteEntry, listEntries, replaceEntries, saveEntry, useLedgerNamespace } from './db';
import { downloadBlob, toCsv } from './exports';
import { parseCsv, previewImport, suggestedColumn, type CsvRows, type ImportMapping, type ImportPreview } from './import';
import { watchForServiceWorkerUpdate } from './service-worker-update';
import { amountToPence, categories, categoryById, dateInQuarter, formatDate, inQuarter, money, quartersFor, taxYearFor, type EntryType, type LedgerEntry } from './types';

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const isDemo = location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';
const storagePrefix = isDemo ? 'demo:' : '';
const storageKey = (key: string) => `${storagePrefix}${key}`;
const receiptTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const currentYear = taxYearFor();
let year = Number(localStorage.getItem(storageKey('quarter-sheet:year'))) || currentYear;
let quarterIndex = 0;
let entries: LedgerEntry[] = [];
let undoEntry: LedgerEntry | null = null;
let undoTimer = 0;
let toastTimer = 0;
let importCsv: CsvRows | null = null;
let importPreview: ImportPreview | null = null;

function demoEntries(taxYear: number): LedgerEntry[] {
  const timestamp = `${taxYear}-05-20T09:00:00.000Z`;
  return [
    { id: 'demo-tutoring', date: `${taxYear}-07-18`, type: 'income', amountPence: 85000, categoryId: 'turnover', note: 'July tutoring invoices', createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-materials', date: `${taxYear}-08-02`, type: 'expense', amountPence: 12640, categoryId: 'cost-goods', note: 'Workshop materials', createdAt: timestamp, updatedAt: timestamp },
    { id: 'demo-travel', date: `${taxYear}-08-14`, type: 'expense', amountPence: 3840, categoryId: 'travel', note: 'Client visits', createdAt: timestamp, updatedAt: timestamp }
  ];
}

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function selectedQuarter() { return quartersFor(year)[quarterIndex]; }
function selectedEntries() { return entries.filter((entry) => inQuarter(entry, selectedQuarter())); }
function findCurrentQuarter() {
  const today = new Date().toISOString().slice(0, 10);
  const index = quartersFor(year).findIndex((q) => today >= q.start && today <= q.end);
  return index >= 0 ? index : 0;
}

function showToast(message: string, action?: { label: string; run: () => void }, duration = 5000) {
  window.clearTimeout(toastTimer);
  const toast = $('#toast') as HTMLElement;
  $('#toast-message').textContent = message;
  const button = $('#toast-action') as HTMLButtonElement;
  button.hidden = !action;
  if (action) { button.textContent = action.label; button.setAttribute('aria-label', action.label); button.onclick = action.run; }
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, duration);
}

function renderYearOptions() {
  const select = $('#tax-year') as HTMLSelectElement;
  select.innerHTML = Array.from({ length: 7 }, (_, index) => currentYear - 3 + index).map((start) => `<option value="${start}">${start}–${String(start + 1).slice(2)}</option>`).join('');
  if (![...select.options].some((option) => Number(option.value) === year)) year = currentYear;
  select.value = String(year);
}

function renderCategoryReference() {
  $('#category-reference').innerHTML = categories.map((category) => `<div><span class="type-mark ${category.type}">${category.type}</span><strong>${escapeHtml(category.label)}</strong><code>${escapeHtml(category.box)}</code><p>${escapeHtml(category.hint)}</p></div>`).join('');
}

function render() {
  const quarters = quartersFor(year);
  const active = quarters[quarterIndex];
  const today = new Date().toISOString().slice(0, 10);
  $('#tax-year-label').textContent = `6 April ${year} to 5 April ${year + 1}`;
  $('#quarter-tabs').innerHTML = quarters.map((quarter, index) => {
    const isCurrent = today >= quarter.start && today <= quarter.end;
    return `<button role="tab" aria-selected="${index === quarterIndex}" tabindex="${index === quarterIndex ? 0 : -1}" data-quarter="${index}"><span>Q${quarter.number}</span><strong>${formatDate(quarter.start).replace(String(year), '').trim()}—${formatDate(quarter.end).replace(String(quarter.end.slice(0, 4)), '').trim()}</strong><small>${isCurrent ? 'Current · ' : ''}Due ${formatDate(quarter.due)}</small></button>`;
  }).join('');
  $('#sheet-heading').textContent = `${active.label} ledger`;
  $('#quarter-range').textContent = `${formatDate(active.start)} — ${formatDate(active.end)}`;
  const dueState = today > active.due ? 'Deadline passed' : today > active.end ? 'Due soon' : 'Quarterly update due';
  $('#quarter-deadline').innerHTML = `<span>${dueState}</span><strong>${formatDate(active.due)}</strong>`;
  const visible = selectedEntries();
  const income = visible.filter((entry) => entry.type === 'income').reduce((total, entry) => total + entry.amountPence, 0);
  const expenses = visible.filter((entry) => entry.type === 'expense').reduce((total, entry) => total + entry.amountPence, 0);
  $('#income-total').textContent = money(income);
  $('#expense-total').textContent = money(expenses);
  $('#net-total').textContent = money(income - expenses);
  $('#entry-count').textContent = visible.length === 0 ? 'No transactions' : `${visible.length} transaction${visible.length === 1 ? '' : 's'}`;
  ($('#export-csv') as HTMLButtonElement).disabled = visible.length === 0;
  ($('#export-xlsx') as HTMLButtonElement).disabled = visible.length === 0;
  renderLedger(visible);
}

function renderLedger(visible: LedgerEntry[]) {
  const state = $('#ledger-state');
  if (!visible.length) {
    state.innerHTML = `<div class="empty-state"><div class="registration-mark" aria-hidden="true">＋</div><h3>This quarter is an empty sheet</h3><p>Add your first income or expense. It stays in this browser and appears in your export.</p><button class="button primary" id="empty-add" type="button">Add first transaction</button></div>`;
    $('#empty-add').addEventListener('click', () => openEntryDialog());
    return;
  }
  state.innerHTML = `<div class="ledger-table"><div class="ledger-head" aria-hidden="true"><span>Date</span><span>Transaction</span><span>Category / mapping</span><span>Amount</span><span></span></div><ul>${visible.map((entry) => {
    const category = categoryById(entry.categoryId);
    const name = escapeHtml(entry.note || category?.label || 'transaction');
    return `<li><time datetime="${entry.date}">${formatDate(entry.date)}</time><div class="entry-note"><span class="type-mark ${entry.type}">${entry.type}</span><strong>${name}</strong>${entry.receipt ? '<button class="receipt-link" type="button" data-receipt="' + entry.id + '">View receipt</button>' : ''}</div><div class="entry-category"><span>${escapeHtml(category?.label || entry.categoryId)}</span><code>${escapeHtml(category?.box || 'Unmapped')}</code></div><strong class="entry-amount ${entry.type}">${entry.type === 'expense' ? '−' : '+'}${money(entry.amountPence)}</strong><div class="row-actions"><button type="button" data-edit="${entry.id}" aria-label="Edit ${name} transaction">Edit</button><button class="danger-link" type="button" data-delete="${entry.id}" aria-label="Delete ${name} transaction">Delete</button></div></li>`;
  }).join('')}</ul></div>`;
  state.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((button) => button.addEventListener('click', () => openEntryDialog(entries.find((entry) => entry.id === button.dataset.edit))));
  state.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => button.addEventListener('click', () => void removeEntry(button.dataset.delete!)));
  state.querySelectorAll<HTMLButtonElement>('[data-receipt]').forEach((button) => button.addEventListener('click', () => viewReceipt(button.dataset.receipt!)));
}

function categoryOptions(type: EntryType, selected?: string) {
  const select = $('#entry-category') as HTMLSelectElement;
  select.innerHTML = categories.filter((category) => category.type === type).map((category) => `<option value="${category.id}" ${category.id === selected ? 'selected' : ''}>${escapeHtml(category.label)} · ${escapeHtml(category.box)}</option>`).join('');
  updateCategoryHelp();
}

function updateCategoryHelp() {
  const category = categoryById(($('#entry-category') as HTMLSelectElement).value);
  $('#category-help').textContent = category ? `${category.hint} Maps to ${category.box}.` : '';
}

function openEntryDialog(entry?: LedgerEntry) {
  const dialog = $('#entry-dialog') as HTMLDialogElement;
  const quarter = selectedQuarter();
  ($('#entry-form') as HTMLFormElement).reset();
  $('#entry-error').textContent = '';
  ($('#entry-id') as HTMLInputElement).value = entry?.id ?? '';
  $('#entry-dialog-title').textContent = entry ? 'Edit transaction' : 'Add transaction';
  const type = entry?.type ?? 'income';
  const radio = document.querySelector<HTMLInputElement>(`input[name="entry-type"][value="${type}"]`)!;
  radio.checked = true;
  categoryOptions(type, entry?.categoryId);
  const dateInput = $('#entry-date') as HTMLInputElement;
  dateInput.min = quarter.start;
  dateInput.max = quarter.end;
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = entry?.date ?? (today >= quarter.start && today <= quarter.end ? today : quarter.start);
  ($('#entry-amount') as HTMLInputElement).value = entry ? (entry.amountPence / 100).toFixed(2) : '';
  ($('#entry-note') as HTMLInputElement).value = entry?.note ?? '';
  $('#receipt-help').textContent = entry?.receipt ? `Current receipt: ${entry.receiptName || 'attached file'}. Choose another file to replace it.` : 'JPG, PNG, WebP or PDF up to 5 MB.';
  dialog.showModal();
  requestAnimationFrame(() => ($('#entry-amount') as HTMLInputElement).focus());
}

async function handleEntrySubmit(event: SubmitEvent) {
  event.preventDefault();
  const error = $('#entry-error');
  error.textContent = '';
  const amount = amountToPence(($('#entry-amount') as HTMLInputElement).value);
  const date = ($('#entry-date') as HTMLInputElement).value;
  const type = document.querySelector<HTMLInputElement>('input[name="entry-type"]:checked')!.value as EntryType;
  const categoryId = ($('#entry-category') as HTMLSelectElement).value;
  const receiptFile = ($('#entry-receipt') as HTMLInputElement).files?.[0];
  if (!date) { error.textContent = 'Choose a date for this transaction.'; return; }
  const quarter = selectedQuarter();
  if (!dateInQuarter(date, quarter)) {
    error.textContent = `Choose a date from ${formatDate(quarter.start)} to ${formatDate(quarter.end)} for this quarter.`;
    return;
  }
  if (!amount) { error.textContent = 'Enter a positive amount with no more than two decimal places.'; return; }
  if (!categoryById(categoryId) || categoryById(categoryId)?.type !== type) { error.textContent = 'Choose a category for this transaction type.'; return; }
  if (receiptFile && !receiptTypes.has(receiptFile.type)) { error.textContent = 'That file type is not supported. Choose a JPG, PNG, WebP or PDF.'; return; }
  if (receiptFile && receiptFile.size > 5 * 1024 * 1024) { error.textContent = 'That receipt is over 5 MB. Choose a smaller image or PDF.'; return; }
  const existingId = ($('#entry-id') as HTMLInputElement).value;
  const existing = entries.find((entry) => entry.id === existingId);
  const now = new Date().toISOString();
  const entry: LedgerEntry = {
    id: existing?.id ?? crypto.randomUUID(), date, type, amountPence: amount, categoryId,
    note: ($('#entry-note') as HTMLInputElement).value.trim(),
    receipt: receiptFile ?? existing?.receipt, receiptName: receiptFile?.name ?? existing?.receiptName,
    createdAt: existing?.createdAt ?? now, updatedAt: now
  };
  try {
    await saveEntry(entry);
    entries = await listEntries();
    ($('#entry-dialog') as HTMLDialogElement).close();
    render();
    showToast(existing ? 'Transaction updated.' : 'Transaction saved in this browser.');
  } catch { error.textContent = 'This transaction could not be saved. Check that browser storage is available and try again.'; }
}

async function removeEntry(id: string) {
  const entry = entries.find((row) => row.id === id);
  if (!entry || !confirm(`Delete ${entry.note || categoryById(entry.categoryId)?.label || 'this transaction'} for ${money(entry.amountPence)}?`)) return;
  await deleteEntry(id);
  undoEntry = entry;
  entries = await listEntries();
  render();
  window.clearTimeout(undoTimer);
  undoTimer = window.setTimeout(() => { undoEntry = null; }, 8000);
  showToast('Transaction deleted.', { label: 'Undo deletion', run: () => void undoDelete() }, 8000);
}

async function undoDelete() {
  if (!undoEntry) return;
  await saveEntry(undoEntry);
  undoEntry = null;
  entries = await listEntries();
  render();
  showToast('Transaction restored.');
}

function viewReceipt(id: string) {
  const entry = entries.find((row) => row.id === id);
  if (!entry?.receipt) return;
  const url = URL.createObjectURL(entry.receipt);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function exportName(extension: string) { return `quarter-sheet-${year}-${year + 1}-q${quarterIndex + 1}.${extension}`; }

async function handleBackup(event: SubmitEvent) {
  event.preventDefault();
  const passphrase = ($('#backup-passphrase') as HTMLInputElement).value;
  if (passphrase.length < 10) { $('#backup-error').textContent = 'Use a passphrase with at least 10 characters.'; return; }
  try {
    $('#backup-error').textContent = '';
    const blob = await encryptBackup(entries, passphrase);
    downloadBlob(blob, `quarter-sheet-backup-${new Date().toISOString().slice(0, 10)}.mtdledger`);
    ($('#backup-passphrase') as HTMLInputElement).value = '';
    localStorage.setItem(storageKey('quarter-sheet:last-backup'), new Date().toISOString());
    if (document.documentElement.classList.contains('supporter')) setSupporter(true);
    showToast('Encrypted backup downloaded. Keep its passphrase safe.');
  } catch { $('#backup-error').textContent = 'The backup could not be created. Check browser download permissions, then create the backup again.'; }
}

async function handleRestore(event: SubmitEvent) {
  event.preventDefault();
  const file = ($('#restore-file') as HTMLInputElement).files?.[0];
  const passphrase = ($('#restore-passphrase') as HTMLInputElement).value;
  if (!file || !passphrase) { $('#backup-error').textContent = 'Choose a backup file and enter its passphrase.'; return; }
  try {
    const restored = await decryptBackup(file, passphrase);
    if (!confirm(`Replace this browser's ${entries.length} transaction${entries.length === 1 ? '' : 's'} with ${restored.length} from the backup?`)) return;
    await replaceEntries(restored);
    entries = await listEntries();
    ($('#backup-dialog') as HTMLDialogElement).close();
    render();
    showToast(`${restored.length} transaction${restored.length === 1 ? '' : 's'} restored.`);
  } catch (reason) { $('#backup-error').textContent = reason instanceof Error ? reason.message : 'The backup could not be restored.'; }
}

const licenseKey = 'sb_license:mtd-quarterly-ledger';
const verdictKey = `${licenseKey}:verdict`;
const billingBase = import.meta.env.VITE_BILLING_BASE || 'https://api.sociobot.in';

function setSupporter(active: boolean, message?: string) {
  document.documentElement.classList.toggle('supporter', active);
  ($('#supporter-badge') as HTMLElement).hidden = !active;
  const lastBackup = localStorage.getItem(storageKey('quarter-sheet:last-backup'));
  const backupDue = !lastBackup || Date.now() - new Date(lastBackup).getTime() > 30 * 86_400_000;
  const backupDate = lastBackup ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(lastBackup)) : '';
  $('#license-status').textContent = message ?? (active ? `Supporter access is active.${backupDue ? ' Your encrypted backup is due.' : ` Your last backup was ${backupDate}.`}` : 'No supporter access in this browser.');
  $('#buy-license').textContent = active ? 'Supporter access is active' : 'Buy supporter access on Sociobot';
}

function fillImportOptions(select: HTMLSelectElement, headers: string[], selected: string, allowBlank = false) {
  select.innerHTML = `${allowBlank ? '<option value="">No type column</option>' : ''}${headers.map((header) => `<option value="${escapeHtml(header)}">${escapeHtml(header)}</option>`).join('')}`;
  select.value = selected;
}

function importMapping(): ImportMapping {
  return {
    date: ($('#import-date') as HTMLSelectElement).value,
    description: ($('#import-description') as HTMLSelectElement).value,
    amount: ($('#import-amount') as HTMLSelectElement).value,
    type: ($('#import-type') as HTMLSelectElement).value,
    fallbackType: document.querySelector<HTMLInputElement>('input[name="import-fallback-type"]:checked')!.value as EntryType,
    categoryId: ($('#import-category') as HTMLSelectElement).value
  };
}

function renderImportPreview(preview?: ImportPreview) {
  const target = $('#import-preview');
  const confirm = $('#confirm-import') as HTMLButtonElement;
  if (!preview) { target.textContent = ''; confirm.disabled = true; return; }
  const rejected = preview.rejected.length ? `<ul>${preview.rejected.slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  target.innerHTML = `<strong>${preview.accepted.length} row${preview.accepted.length === 1 ? '' : 's'} ready to import.</strong> ${preview.duplicates} duplicate${preview.duplicates === 1 ? '' : 's'} skipped. ${preview.rejected.length} row${preview.rejected.length === 1 ? '' : 's'} rejected.${rejected}`;
  confirm.disabled = preview.accepted.length === 0;
}

async function readImportFile() {
  const file = ($('#import-file') as HTMLInputElement).files?.[0];
  const error = $('#import-error');
  error.textContent = '';
  renderImportPreview();
  if (!file) return;
  if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') { error.textContent = 'Choose a CSV file, then try again.'; return; }
  importCsv = parseCsv(await file.text());
  if (importCsv.headers.length < 3 || importCsv.rows.length === 0) { error.textContent = 'That CSV needs a header row and at least one transaction row.'; return; }
  fillImportOptions($('#import-date') as HTMLSelectElement, importCsv.headers, suggestedColumn(importCsv.headers, 'date'));
  fillImportOptions($('#import-description') as HTMLSelectElement, importCsv.headers, suggestedColumn(importCsv.headers, 'description'));
  fillImportOptions($('#import-amount') as HTMLSelectElement, importCsv.headers, suggestedColumn(importCsv.headers, 'amount'));
  fillImportOptions($('#import-type') as HTMLSelectElement, importCsv.headers, suggestedColumn(importCsv.headers, 'type'), true);
  const category = $('#import-category') as HTMLSelectElement;
  category.innerHTML = categories.map((item) => `<option value="${item.id}">${escapeHtml(item.label)} · ${escapeHtml(item.box)}</option>`).join('');
  category.value = 'turnover';
  ($('#import-mapping') as HTMLElement).hidden = false;
}

function previewCsvImport() {
  const error = $('#import-error');
  error.textContent = '';
  if (!importCsv) { error.textContent = 'Choose a CSV file before previewing it.'; return; }
  importPreview = previewImport(importCsv, importMapping(), selectedQuarter(), entries);
  renderImportPreview(importPreview);
}

async function confirmCsvImport(event: SubmitEvent) {
  event.preventDefault();
  if (!importPreview?.accepted.length) { $('#import-error').textContent = 'Preview accepted rows before importing them.'; return; }
  for (const entry of importPreview.accepted) await saveEntry(entry);
  entries = await listEntries();
  ($('#import-dialog') as HTMLDialogElement).close();
  render();
  showToast(`${importPreview.accepted.length} transaction${importPreview.accepted.length === 1 ? '' : 's'} imported into this browser.`);
}

async function verifyLicense(token: string, force = false) {
  const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { checkedAt?: number; valid?: boolean } | null;
  if (!force && typeof cached?.valid === 'boolean' && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) {
    setSupporter(cached.valid, cached.valid ? undefined : 'Supporter access could not be verified. You can buy supporter access again.');
    return cached.valid;
  }
  if (cached?.valid) setSupporter(true, 'Supporter access is active while verification completes.');
  try {
    const response = await fetch(`${billingBase}/api/v1/products/mtd-quarterly-ledger/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(verdictKey, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    setSupporter(result.valid, result.valid ? undefined : 'Supporter access could not be verified. You can buy supporter access again.');
    return result.valid;
  } catch { if (!cached?.valid) setSupporter(false, 'Connect to the internet to verify supporter access.'); return Boolean(cached?.valid); }
}

async function initLicense() {
  const params = new URLSearchParams(location.search);
  const returned = params.get('license');
  if (returned) {
    localStorage.setItem(licenseKey, returned);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
  }
  const token = returned || localStorage.getItem(licenseKey);
  if (token) await verifyLicense(token);
}

function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let updateRequested = false;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    const announce = () => showToast('A Quarter sheet update is ready.', { label: 'Install update', run: () => { updateRequested = true; registration.waiting?.postMessage({ type: 'SKIP_WAITING' }); } }, 30_000);
    if (registration.waiting) announce();
    watchForServiceWorkerUpdate(registration, () => Boolean(navigator.serviceWorker.controller), announce);
  }).catch(() => { /* The ledger remains usable without installation support. */ });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updateRequested) location.reload(); });
}

function bindEvents() {
  $('#tax-year').addEventListener('change', (event) => { year = Number((event.target as HTMLSelectElement).value); localStorage.setItem(storageKey('quarter-sheet:year'), String(year)); quarterIndex = findCurrentQuarter(); render(); });
  $('#quarter-tabs').addEventListener('click', (event) => { const button = (event.target as Element).closest<HTMLButtonElement>('[data-quarter]'); if (button) { quarterIndex = Number(button.dataset.quarter); render(); } });
  $('#quarter-tabs').addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight'].includes((event as KeyboardEvent).key)) return; event.preventDefault(); const direction = (event as KeyboardEvent).key === 'ArrowRight' ? 1 : -1; const focused = Number((event.target as HTMLButtonElement).dataset.quarter); quarterIndex = (focused + direction + 4) % 4; render(); document.querySelector<HTMLButtonElement>(`[data-quarter="${quarterIndex}"]`)?.focus(); });
  $('#add-entry').addEventListener('click', () => openEntryDialog());
  $('#hero-add-entry').addEventListener('click', () => openEntryDialog());
  $('#entry-form').addEventListener('submit', (event) => void handleEntrySubmit(event as SubmitEvent));
  document.querySelectorAll<HTMLInputElement>('input[name="entry-type"]').forEach((radio) => radio.addEventListener('change', () => categoryOptions(radio.value as EntryType)));
  $('#entry-category').addEventListener('change', updateCategoryHelp);
  document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach((button) => button.addEventListener('click', () => ($('#' + button.dataset.close!) as HTMLDialogElement).close()));
  $('#export-csv').addEventListener('click', () => { downloadBlob(new Blob([toCsv(selectedEntries())], { type: 'text/csv;charset=utf-8' }), exportName('csv')); showToast('Quarter CSV exported.'); });
  $('#export-xlsx').addEventListener('click', async () => { const { toXlsx } = await import('./xlsx'); downloadBlob(toXlsx(selectedEntries()), exportName('xlsx')); showToast('Quarter XLSX exported.'); });
  $('#import-csv').addEventListener('click', () => {
    importCsv = null; importPreview = null;
    ($('#import-form') as HTMLFormElement).reset();
    ($('#import-mapping') as HTMLElement).hidden = true;
    $('#import-error').textContent = '';
    renderImportPreview();
    ($('#import-dialog') as HTMLDialogElement).showModal();
    requestAnimationFrame(() => ($('#import-file') as HTMLInputElement).focus());
  });
  $('#import-file').addEventListener('change', () => void readImportFile());
  $('#preview-import').addEventListener('click', previewCsvImport);
  $('#import-form').addEventListener('submit', (event) => void confirmCsvImport(event as SubmitEvent));
  $('#backup-open').addEventListener('click', () => { $('#backup-error').textContent = ''; ($('#backup-dialog') as HTMLDialogElement).showModal(); });
  $('#backup-form').addEventListener('submit', (event) => void handleBackup(event as SubmitEvent));
  $('#restore-form').addEventListener('submit', (event) => void handleRestore(event as SubmitEvent));
  $('#restore-license').addEventListener('click', () => ($('#license-dialog') as HTMLDialogElement).showModal());
  $('#license-form').addEventListener('submit', async (event) => { event.preventDefault(); const token = ($('#license-token') as HTMLInputElement).value.trim(); if (!token) { $('#license-error').textContent = 'Paste your supporter access token, then verify it.'; return; } localStorage.setItem(licenseKey, token); const valid = await verifyLicense(token, true); if (valid) { ($('#license-dialog') as HTMLDialogElement).close(); showToast('Supporter access restored. Thank you.'); } else $('#license-error').textContent = 'Supporter access could not be verified. Check the token and try again.'; });
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  if (isDemo) {
    $('#reset-demo').addEventListener('click', () => void resetDemo());
    $('#start-real').addEventListener('click', () => void leaveDemo());
  }
}

function clearDemoPreferences() {
  Object.keys(localStorage).filter((key) => key.startsWith('demo:')).forEach((key) => localStorage.removeItem(key));
}

async function leaveDemo() {
  await clearEntries();
  clearDemoPreferences();
  location.assign('/');
}

async function resetDemo() {
  await clearEntries();
  clearDemoPreferences();
  year = currentYear;
  await replaceEntries(demoEntries(year));
  entries = await listEntries();
  quarterIndex = findCurrentQuarter();
  render();
  showToast('Sample records reset.');
}

async function updateConnection() {
  let online = navigator.onLine;
  if (online) {
    try { await fetch('/manifest.webmanifest', { method: 'HEAD', cache: 'no-store' }); }
    catch { online = false; }
  }
  ($('#offline-banner') as HTMLElement).hidden = online;
}

async function init() {
  useLedgerNamespace(isDemo);
  document.documentElement.dataset.mode = isDemo ? 'demo' : 'real';
  if (isDemo) {
    document.title = 'Demo — Quarter sheet';
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', 'https://mtd-quarterly-ledger.sociobot.in/demo/');
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', 'Demo — Quarter sheet');
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', 'https://mtd-quarterly-ledger.sociobot.in/demo/');
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', 'Demo — Quarter sheet');
    const demoDescription = 'Try a populated quarterly income and expense ledger with isolated sample records.';
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', demoDescription);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', demoDescription);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', demoDescription);
    $('#page-title').textContent = 'Sample quarterly ledger';
    document.querySelector<HTMLElement>('.intro .eyebrow')!.textContent = 'Isolated demo workspace';
    $('#route-announcement').textContent = 'Demo ledger loaded.';
    ($('#demo-banner') as HTMLElement).hidden = false;
  }
  renderYearOptions();
  renderCategoryReference();
  quarterIndex = findCurrentQuarter();
  bindEvents();
  updateConnection();
  try {
    entries = await listEntries();
    if (isDemo && entries.length === 0) {
      await replaceEntries(demoEntries(year));
      entries = await listEntries();
    }
    render();
  }
  catch {
    $('#ledger-state').innerHTML = '<div class="error-state"><h3>Local storage is unavailable</h3><p>Your browser may be blocking site data. Allow storage for this site, then reload before entering records.</p><button class="button secondary" id="storage-reload" type="button">Reload ledger</button></div>';
    $('#storage-reload').addEventListener('click', () => location.reload());
  }
  if (!isDemo) void initLicense();
  setupServiceWorker();
  requestAnimationFrame(() => {
    ($('#page-title') as HTMLElement).focus();
    if (!isDemo) $('#route-announcement').textContent = 'Quarterly ledger loaded.';
  });
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) requestAnimationFrame(() => ($('#page-title') as HTMLElement).focus());
});

void init();
