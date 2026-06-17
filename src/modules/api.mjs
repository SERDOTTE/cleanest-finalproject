/**
 * API Integration Module
 * Centralizes all fetch calls. In Vite dev, /submit is proxied to
 * the Express backend on port 3000 via vite.config.js.
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

/**
 * Busca endereco pelo CEP usando ViaCEP (API publica gratuita).
 * @param {string} cep
 * @returns {Promise<{ street: string, neighborhood: string, city: string, state: string, zipCode: string }>}
 */
export async function fetchAddressByCep(cep) {
  const normalizedCep = String(cep ?? '').replace(/\D/g, '');
  if (normalizedCep.length !== 8) {
    throw new Error('CEP invalido. Use 8 digitos.');
  }

  const res = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
  if (!res.ok) {
    throw new Error(`Falha ao consultar CEP (${res.status}).`);
  }

  const data = await res.json();
  if (data.erro) {
    throw new Error('CEP nao encontrado.');
  }

  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
    zipCode: normalizedCep,
  };
}

/**
 * Consulta disponibilidade de horario no Google Calendar via backend.
 * @param {{ start: string, end: string }} payload
 */
export function getCalendarAvailability(payload) {
  return apiFetch('/calendar/availability', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Cria evento de agendamento no Google Calendar via backend.
 * @param {object} payload
 */
export function createCalendarBooking(payload) {
  return apiFetch('/calendar/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}