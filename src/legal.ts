import './style.css';
import { renderBuildLabel } from './build';

function focusRoute() {
  const heading = document.querySelector<HTMLElement>('main h1');
  heading?.focus();
  const live = document.querySelector<HTMLElement>('[data-route-announcement]');
  if (live && heading) live.textContent = `${heading.textContent} loaded.`;
}

window.addEventListener('DOMContentLoaded', () => { renderBuildLabel(); focusRoute(); });
window.addEventListener('pageshow', (event) => { if (event.persisted) focusRoute(); });
