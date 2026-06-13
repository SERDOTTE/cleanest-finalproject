import { renderHome, initHome } from './pages/home.mjs';
import { renderServices, initServices } from './pages/services.mjs';
import { renderAbout } from './pages/about.mjs';
import { renderContact, initContact } from './pages/contact.mjs';
import { renderAdmin, initAdmin } from './pages/admin.mjs';

/** Route map: hash → { render, init } */
const routes = {
  home: { render: renderHome, init: initHome },
  services: { render: renderServices, init: initServices },
  about: { render: renderAbout, init: null },
  contact: { render: renderContact, init: initContact },
  admin: { render: renderAdmin, init: initAdmin },
};

const DEFAULT_ROUTE = 'home';

function getRouteKey() {
  const hash = window.location.hash.replace('#', '').trim();
  return routes[hash] ? hash : DEFAULT_ROUTE;
}

function navigate(routeKey) {
  const route = routes[routeKey];
  if (!route) return;

  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = route.render();

  // Sync active link state
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === routeKey);
  });

  if (route.init) route.init();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function initRouter() {
  window.addEventListener('hashchange', () => navigate(getRouteKey()));

  // Intercept clicks on nav links before hashchange fires to avoid double render
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.dataset.route;
      window.location.hash = key;
      navigate(key);
    });
  });

  // Delegate CTA buttons rendered inside pages
  document.getElementById('app')?.addEventListener('click', (e) => {
    const target = e.target.closest('[data-route]');
    if (target) {
      e.preventDefault();
      const key = target.dataset.route;
      window.location.hash = key;
      navigate(key);
    }
  });

  // Initial render
  navigate(getRouteKey());
}
