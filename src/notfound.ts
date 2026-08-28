import './style.css';
import { renderBuildLabel } from './build';

const focusHeading = () => document.querySelector<HTMLElement>('h1')?.focus();
window.addEventListener('DOMContentLoaded', () => { renderBuildLabel(); focusHeading(); });
window.addEventListener('pageshow', (event) => { if (event.persisted) focusHeading(); });
