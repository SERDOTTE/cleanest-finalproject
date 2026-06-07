/**
 * Menu UI Module
 * Handles hamburger toggle and responsive nav.
 * Migrated from scripts/menu.js — now an explicit exported init function.
 */
export function initMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const closeBtn  = document.querySelector('.close-menu');
  const navMenu   = document.querySelector('.navigation');

  if (!hamburger || !closeBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('active');
    hamburger.style.display = 'none';
    closeBtn.style.display  = 'block';
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    hamburger.style.display = 'block';
    closeBtn.style.display  = 'none';
  }

  function syncDisplay() {
    if (window.innerWidth > 900) {
      hamburger.style.display = 'none';
      closeBtn.style.display  = 'none';
    } else {
      const isOpen = navMenu.classList.contains('active');
      hamburger.style.display = isOpen ? 'none'  : 'block';
      closeBtn.style.display  = isOpen ? 'block' : 'none';
    }
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  window.addEventListener('resize', syncDisplay);
  syncDisplay();
}
