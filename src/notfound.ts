import './style.css';

const focusHeading = () => document.querySelector<HTMLElement>('h1')?.focus();
window.addEventListener('DOMContentLoaded', focusHeading);
window.addEventListener('pageshow', (event) => { if (event.persisted) focusHeading(); });
