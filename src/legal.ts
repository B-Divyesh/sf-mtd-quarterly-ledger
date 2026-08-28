import './style.css';

window.addEventListener('DOMContentLoaded', () => {
  const heading = document.querySelector<HTMLElement>('main h1');
  heading?.focus();
  const live = document.querySelector<HTMLElement>('[data-route-announcement]');
  if (live && heading) live.textContent = `${heading.textContent} loaded.`;
});
