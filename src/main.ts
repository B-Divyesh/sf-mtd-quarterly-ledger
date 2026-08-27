import './style.css';
import { decryptBackup, encryptBackup } from './backup';
import { deleteEntry, listEntries, replaceEntries, saveEntry } from './db';
import { downloadBlob, toCsv } from './exports';
import { amountToPence, categories, categoryById, formatDate, inQuarter, money, quartersFor, taxYearFor, type EntryType, type LedgerEntry } from './types';

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const currentYear = taxYearFor();
let year = Number(localStorage.getItem('quarter-sheet:year')) || currentYear;
let quarterIndex = 0;
let entries: LedgerEntry[] = [];
let undoEntry: LedgerEntry | null = null;
let undoTimer = 0;
let toastTimer = 0;

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
  if (action) { button.textContent = action.label; button.onclick = action.run; }
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
    state.innerHTML = `<div class="empty-state"><div class="registration-mark" aria-hidden="true">＋</div><h3>This quarter is an empty sheet</h3><p>Add your first income or expense. It stays on this device and appears in your export.</p><button class="button primary" id="empty-add" type="button">Add first transaction</button></div>`;
    $('#empty-add').addEventListener('click', () => openEntryDialog());
    return;
  }
  state.innerHTML = `<div class="ledger-table"><div class="ledger-head" aria-hidden="true"><span>Date</span><span>Line</span><span>Category / mapping</span><span>Amount</span><span></span></div><ul>${visible.map((entry) => {
    const category = categoryById(entry.categoryId);
    return `<li><time datetime="${entry.date}">${formatDate(entry.date)}</time><div class="entry-note"><span class="type-mark ${entry.type}">${entry.type}</span><strong>${escapeHtml(entry.note || category?.label || 'Transaction')}</strong>${entry.receipt ? '<button class="receipt-link" type="button" data-receipt="' + entry.id + '">View receipt</button>' : ''}</div><div class="entry-category"><span>${escapeHtml(category?.label || entry.categoryId)}</span><code>${escapeHtml(category?.box || 'Unmapped')}</code></div><strong class="entry-amount ${entry.type}">${entry.type === 'expense' ? '−' : '+'}${money(entry.amountPence)}</strong><div class="row-actions"><button type="button" data-edit="${entry.id}">Edit</button><button class="danger-link" type="button" data-delete="${entry.id}">Delete</button></div></li>`;
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
  if (!amount) { error.textContent = 'Enter a positive amount with no more than two decimal places.'; return; }
  if (!categoryById(categoryId) || categoryById(categoryId)?.type !== type) { error.textContent = 'Choose a category for this transaction type.'; return; }
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
    showToast(existing ? 'Transaction updated.' : 'Transaction saved on this device.');
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
  showToast('Transaction deleted.', { label: 'Undo', run: () => void undoDelete() }, 8000);
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
    localStorage.setItem('quarter-sheet:last-backup', new Date().toISOString());
    showToast('Encrypted backup downloaded. Keep its passphrase safe.');
  } catch { $('#backup-error').textContent = 'The backup could not be created. Try again.'; }
}

async function handleRestore(event: SubmitEvent) {
  event.preventDefault();
  const file = ($('#restore-file') as HTMLInputElement).files?.[0];
  const passphrase = ($('#restore-passphrase') as HTMLInputElement).value;
  if (!file || !passphrase) { $('#backup-error').textContent = 'Choose a backup file and enter its passphrase.'; return; }
  try {
    const restored = await decryptBackup(file, passphrase);
    if (!confirm(`Replace this device's ${entries.length} transaction${entries.length === 1 ? '' : 's'} with ${restored.length} from the backup?`)) return;
    await replaceEntries(restored);
    entries = await listEntries();
    ($('#backup-dialog') as HTMLDialogElement).close();
    render();
    showToast(`${restored.length} transaction${restored.length === 1 ? '' : 's'} restored.`);
  } catch (reason) { $('#backup-error').textContent = reason instanceof Error ? reason.message : 'The backup could not be restored.'; }
}

const licenseKey = 'sb_license:mtd-quarterly-ledger';
const verdictKey = `${licenseKey}:verdict`;
const billingBase = import.meta.env.VITE_BILLING_BASE || 'https://pilot-api.sociobot.in';

function setSupporter(active: boolean, message?: string) {
  document.documentElement.classList.toggle('supporter', active);
  $('#license-status').textContent = message ?? (active ? 'Supporter unlock active on this device.' : 'No supporter license on this device.');
  $('#buy-license').textContent = active ? 'Supporter unlock active' : 'Buy supporter unlock';
}

async function verifyLicense(token: string, force = false) {
  const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { checkedAt?: number; valid?: boolean } | null;
  if (!force && cached?.valid && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) { setSupporter(true); return true; }
  if (cached?.valid) setSupporter(true, 'Supporter unlock active; checking quietly…');
  try {
    const response = await fetch(`${billingBase}/api/v1/products/mtd-quarterly-ledger/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(verdictKey, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
    setSupporter(result.valid, result.valid ? undefined : 'License no longer active. You can buy a new supporter unlock.');
    return result.valid;
  } catch { if (!cached?.valid) setSupporter(false, 'Could not verify the license while offline. Try again when connected.'); return Boolean(cached?.valid); }
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
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    const announce = () => showToast('A fresh version is ready.', { label: 'Update now', run: () => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }) }, 30_000);
    if (registration.waiting) announce();
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => {
      if (registration.installing?.state === 'installed' && navigator.serviceWorker.controller) announce();
    }));
  }).catch(() => { /* The ledger remains usable without installation support. */ });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!refreshing) { refreshing = true; location.reload(); } });
}

function bindEvents() {
  $('#tax-year').addEventListener('change', (event) => { year = Number((event.target as HTMLSelectElement).value); localStorage.setItem('quarter-sheet:year', String(year)); quarterIndex = findCurrentQuarter(); render(); });
  $('#quarter-tabs').addEventListener('click', (event) => { const button = (event.target as Element).closest<HTMLButtonElement>('[data-quarter]'); if (button) { quarterIndex = Number(button.dataset.quarter); render(); } });
  $('#quarter-tabs').addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight'].includes((event as KeyboardEvent).key)) return; const direction = (event as KeyboardEvent).key === 'ArrowRight' ? 1 : -1; quarterIndex = (quarterIndex + direction + 4) % 4; render(); document.querySelector<HTMLButtonElement>(`[data-quarter="${quarterIndex}"]`)?.focus(); });
  $('#add-entry').addEventListener('click', () => openEntryDialog());
  $('#entry-form').addEventListener('submit', (event) => void handleEntrySubmit(event as SubmitEvent));
  document.querySelectorAll<HTMLInputElement>('input[name="entry-type"]').forEach((radio) => radio.addEventListener('change', () => categoryOptions(radio.value as EntryType)));
  $('#entry-category').addEventListener('change', updateCategoryHelp);
  document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach((button) => button.addEventListener('click', () => ($('#' + button.dataset.close!) as HTMLDialogElement).close()));
  $('#export-csv').addEventListener('click', () => { downloadBlob(new Blob([toCsv(selectedEntries())], { type: 'text/csv;charset=utf-8' }), exportName('csv')); showToast('Quarter CSV exported.'); });
  $('#export-xlsx').addEventListener('click', async () => { const { toXlsx } = await import('./xlsx'); downloadBlob(toXlsx(selectedEntries()), exportName('xlsx')); showToast('Quarter XLSX exported.'); });
  $('#backup-open').addEventListener('click', () => { $('#backup-error').textContent = ''; ($('#backup-dialog') as HTMLDialogElement).showModal(); });
  $('#backup-form').addEventListener('submit', (event) => void handleBackup(event as SubmitEvent));
  $('#restore-form').addEventListener('submit', (event) => void handleRestore(event as SubmitEvent));
  $('#restore-license').addEventListener('click', () => ($('#license-dialog') as HTMLDialogElement).showModal());
  $('#license-form').addEventListener('submit', async (event) => { event.preventDefault(); const token = ($('#license-token') as HTMLInputElement).value.trim(); if (!token) return; localStorage.setItem(licenseKey, token); const valid = await verifyLicense(token, true); if (valid) { ($('#license-dialog') as HTMLDialogElement).close(); showToast('Supporter unlock restored. Thank you.'); } else $('#license-error').textContent = 'That license could not be verified. Check the token and try again.'; });
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
}

function updateConnection() { ($('#offline-banner') as HTMLElement).hidden = navigator.onLine; }

async function init() {
  renderYearOptions();
  renderCategoryReference();
  quarterIndex = findCurrentQuarter();
  bindEvents();
  updateConnection();
  try { entries = await listEntries(); render(); }
  catch { $('#ledger-state').innerHTML = '<div class="error-state"><h3>Local storage is unavailable</h3><p>Your browser may be blocking site data. Allow storage for this site, then reload before entering records.</p><button class="button secondary" onclick="location.reload()">Reload ledger</button></div>'; }
  void initLicense();
  setupServiceWorker();
}

void init();
