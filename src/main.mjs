// importation of styles
import '../styles/base.css';
import '../styles/header.css'; 
import '../styles/footer.css';
import '../styles/index.css';
import '../styles/services.css';
import '../styles/about.css';
import '../styles/contact.css';
import '../styles/admin.css';
import '../styles/animations.css';

// Both HTML rendering and Header events are important.
import { renderHeader, initHeader } from './pages/header.mjs'; 
import { renderFooter, initFooter } from './pages/footer.mjs';
import { initTheme } from './modules/ui/theme.mjs';
import { initRouter } from './router.mjs';
import { recoverSession } from './modules/storage.mjs';

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Inject the structural HTML into the header of index.html.
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.innerHTML = renderHeader();
  }

  // 2. Inject the structural HTML into the footer of index.html.
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.innerHTML = renderFooter();
  }

  // 4. Initialize event logic (Hamburger click, routes, etc.)
  initHeader(); // Now this guy will find the buttons perfectly
  initFooter();
  initTheme();
  recoverSession();
  initRouter();
});