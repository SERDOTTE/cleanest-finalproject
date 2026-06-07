import '../styles/base.css';
import '../styles/index.css';
import '../styles/services.css';
import '../styles/about.css';
import '../styles/contact.css';
import '../styles/admin.css';
import '../styles/animations.css';

import { initMenu } from './modules/ui/menu.mjs';
import { initTheme } from './modules/ui/theme.mjs';
import { initRouter } from './router.mjs';
import { recoverSession } from './modules/storage.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('copyrightYear');
  const modifiedEl = document.getElementById('lastModified');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (modifiedEl) modifiedEl.textContent = document.lastModified;

  initMenu();
  initTheme();
  recoverSession();
  initRouter();
});
