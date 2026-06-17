/**
 * Booking & Scheduling Module
 * Manages multi-step wizard state and slot validation.
 *
 */

import { saveSession, loadSession, clearSession } from './storage.mjs';

export const WIZARD_STEPS = {
  ITEM_SELECTION: 1,
  ADDRESS_VALIDATION: 2,
  DATETIME_CHOICE: 3,
  CONFIRMATION: 4,
};

const BOOKING_DRAFT_KEY = 'bookingDraft';

/**
 * Create an empty booking state.
 * @returns {object}
 */
export function createBookingState() {
  return {
    step: WIZARD_STEPS.ITEM_SELECTION,
    items: [], // [{ service, size, soilDepth }]
    address: {
      zipCode: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
    },
    distanceKm: 0,
    date: '',
    time: '',
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    quote: null, // Result from calculator.mjs calculateQuote()
  };
}

function normalizeBookingState(state = {}) {
  const base = createBookingState();
  const address = { ...base.address, ...(state.address ?? {}) };
  const customer = { ...base.customer, ...(state.customer ?? {}) };
  const distanceKm = Number.isFinite(Number(state.distanceKm)) ? Math.max(0, Number(state.distanceKm)) : 0;

  return {
    ...base,
    ...state,
    step: Number.isFinite(Number(state.step)) ? Number(state.step) : base.step,
    items: Array.isArray(state.items) ? state.items : [],
    address,
    customer,
    distanceKm,
    date: state.date ?? '',
    time: state.time ?? '',
  };
}

/**
 * Load persisted booking draft or return a fresh state.
 * @returns {object}
 */
export function loadBookingDraft() {
  return normalizeBookingState(loadSession(BOOKING_DRAFT_KEY) ?? createBookingState());
}

/**
 * Persist booking draft to localStorage.
 * @param {object} state
 */
export function saveBookingDraft(state) {
  const normalized = normalizeBookingState(state);
  saveSession(BOOKING_DRAFT_KEY, normalized);
  return normalized;
}

/**
 * Merge partial updates into booking state and persist.
 * @param {object} state
 * @param {object} patch
 * @returns {object}
 */
export function updateBookingState(state, patch = {}) {
  const merged = {
    ...state,
    ...patch,
    address: { ...(state.address ?? {}), ...(patch.address ?? {}) },
    customer: { ...(state.customer ?? {}), ...(patch.customer ?? {}) },
  };

  return saveBookingDraft(merged);
}

/**
 * Validate the given wizard step and advance if valid.
 * @param {object} state
 * @returns {{ state: object, errors: string[] }}
 */
export function advanceStep(state) {
  const errors = validateStep(state, state.step);
  if (errors.length > 0) return { state, errors };

  const nextStep = Math.min(state.step + 1, WIZARD_STEPS.CONFIRMATION);
  const newState = saveBookingDraft({ ...state, step: nextStep });
  return { state: newState, errors: [] };
}

/**
 * Move wizard one step back.
 * @param {object} state
 * @returns {object}
 */
export function retreatStep(state) {
  const previousStep = Math.max(state.step - 1, WIZARD_STEPS.ITEM_SELECTION);
  return saveBookingDraft({ ...state, step: previousStep });
}

/**
 * Validate a specific wizard step.
 * @param {object} state
 * @param {number} step
 * @returns {string[]} Validation errors (empty array = valid)
 */
export function validateStep(state, step) {
  const errors = [];

  if (step === WIZARD_STEPS.ITEM_SELECTION && state.items.length === 0) {
    errors.push('Please select at least one service item.');
  }

  if (step === WIZARD_STEPS.ADDRESS_VALIDATION) {
    const { zipCode, street, number, neighborhood, city } = state.address ?? {};
    if (!zipCode?.trim() || !street?.trim() || !number?.trim() || !neighborhood?.trim() || !city?.trim()) {
      errors.push('Please provide a complete service address.');
    }
  }

  if (step === WIZARD_STEPS.DATETIME_CHOICE) {
    if (!state.customer?.name?.trim() || !state.customer?.email?.trim()) {
      errors.push('Please provide customer name and email.');
    }
    if (!state.date || !state.time) {
      errors.push('Please select a date and time.');
    }
  }

  return errors;
}

/**
 * Progress percentage by current step.
 * @param {number} step
 * @returns {number}
 */
export function getWizardProgress(step) {
  const clamped = Math.min(Math.max(step, WIZARD_STEPS.ITEM_SELECTION), WIZARD_STEPS.CONFIRMATION);
  return Math.round((clamped / WIZARD_STEPS.CONFIRMATION) * 100);
}

/** Clear persisted booking draft. */
export function resetBookingDraft() {
  clearSession(BOOKING_DRAFT_KEY);
}

// ── Stubs for Week 7 ─────────────────────────────────────────────────────────

// export async function getAvailableSlots(date) { ... }
// export async function confirmBooking(state) { ... }
