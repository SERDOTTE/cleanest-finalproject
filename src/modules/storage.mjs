/**
 * Data Persistence Module
 * Safe read/write operations on localStorage with namespace prefix.
 * Also provides cart-abandonment recovery and theme persistence.
 */

const PREFIX = 'cleannest_';

/** Save a value to localStorage under a namespaced key. */
export function saveSession(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('[Storage] Failed to save:', key, e);
  }
}

/** Load a value from localStorage. Returns null if missing or unparseable. */
export function loadSession(key) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw !== null ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[Storage] Failed to load:', key, e);
    return null;
  }
}

/** Remove a specific key from localStorage. */
export function clearSession(key) {
  localStorage.removeItem(`${PREFIX}${key}`);
}

/**
 * Check for an abandoned contact/booking draft on app startup.
 * Recovery is handled silently — contact.mjs reads the draft on init.
 * @returns {boolean} true if a draft was found
 */
export function recoverSession() {
  const contactDraft = loadSession('contactDraft');
  const bookingDraft = loadSession('bookingDraft');

  const hasContactDraft = !!(contactDraft && (contactDraft.name || contactDraft.email));
  const hasBookingDraft = !!(
    bookingDraft &&
    ((Array.isArray(bookingDraft.items) && bookingDraft.items.length > 0)
      || bookingDraft.customer?.name
      || bookingDraft.customer?.email)
  );

  return hasContactDraft || hasBookingDraft;
}

/** Persist user theme preference. */
export function saveTheme(theme) {
  saveSession('theme', theme);
}

/** Load user theme preference. Defaults to 'light'. */
export function loadTheme() {
  return loadSession('theme') ?? 'light';
}
