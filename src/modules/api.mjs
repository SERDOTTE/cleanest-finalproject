/**
 * API Integration Module
 * Centralizes all fetch calls. In Vite dev, /submit is proxied to
 * the Express backend on port 3000 via vite.config.js.
 *
 * TODO (Week 7): Add Google Maps Geocoding wrapper.
 * TODO (Week 7): Add Google Calendar availability and event creation.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

/**
 * Generic fetch wrapper with JSON handling and error reporting.
 * @param {string} path - Endpoint path (e.g. '/submit')
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Submit contact/booking form data to the Express backend.
 * @param {object} payload
 * @returns {Promise<{ message: string }>}
 */
export function submitContact(payload) {
  return apiFetch('/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch saved submissions for the admin panel.
 * @returns {Promise<Array<object>>}
 */
export function getSubmissions() {
  return apiFetch('/submissions', {
    method: 'GET',
  });
}

// ── Stubs for Week 7 ─────────────────────────────────────────────────────────

// export async function geocodeAddress(address) { ... }
// export async function getAvailableSlots(dateRange) { ... }
// export async function createBookingEvent(eventPayload) { ... }
