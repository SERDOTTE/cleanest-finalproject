/**
 * Booking & Scheduling Module
 * Manages multi-step wizard state and slot validation.
 *
 * TODO (Week 6): Implement full wizard UI rendering and step transitions.
 * TODO (Week 7): Integrate Google Calendar for real-time slot availability.
 * TODO (Week 7): Create calendar event on booking confirmation.
 */

import { saveSession, loadSession } from './storage.mjs';

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
    address: null, // { street, number, neighborhood, city, lat, lng }
    date: null,
    time: null,
    quote: null, // Result from calculator.mjs calculateQuote()
  };
}

/**
 * Load persisted booking draft or return a fresh state.
 * @returns {object}
 */
export function loadBookingDraft() {
  return loadSession(BOOKING_DRAFT_KEY) ?? createBookingState();
}

/**
 * Persist booking draft to localStorage.
 * @param {object} state
 */
export function saveBookingDraft(state) {
  saveSession(BOOKING_DRAFT_KEY, state);
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
  const newState = { ...state, step: nextStep };
  saveBookingDraft(newState);
  return { state: newState, errors: [] };
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
  if (step === WIZARD_STEPS.ADDRESS_VALIDATION && !state.address) {
    errors.push('Please provide a valid service address.');
  }
  if (step === WIZARD_STEPS.DATETIME_CHOICE && (!state.date || !state.time)) {
    errors.push('Please select a date and time.');
  }
  return errors;
}

// ── Stubs for Week 7 ─────────────────────────────────────────────────────────

// export async function getAvailableSlots(date) { ... }
// export async function confirmBooking(state) { ... }
