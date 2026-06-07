import { saveTheme, loadTheme } from '../storage.mjs';

/**
 * Theme toggle module.
 * Applies and persists light/dark preference via data-theme on <html>.
 * CSS vars for dark mode go in styles/base.css under [data-theme="dark"].
 */
export function initTheme() {
  const btn = document.querySelector('.theme-toggle-btn');
  if (!btn) return;

  applyTheme(loadTheme());

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') ?? 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
