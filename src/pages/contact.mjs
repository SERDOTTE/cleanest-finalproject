import {
  submitContact,
  fetchAddressByCep,
  getCalendarAvailability,
  createCalendarBooking,
} from '../modules/api.mjs';
import { clearSession } from '../modules/storage.mjs';
import {
  WIZARD_STEPS,
  createBookingState,
  loadBookingDraft,
  updateBookingState,
  advanceStep,
  retreatStep,
  getWizardProgress,
  validateStep,
  resetBookingDraft,
} from '../modules/booking.mjs';
import { BASE_PRICES, calculateQuote, formatCurrency } from '../modules/calculator.mjs';

const STEP_LABELS = {
  [WIZARD_STEPS.ITEM_SELECTION]: 'Step 1 of 4 - Item Selection',
  [WIZARD_STEPS.ADDRESS_VALIDATION]: 'Step 2 of 4 - Address Validation',
  [WIZARD_STEPS.DATETIME_CHOICE]: 'Step 3 of 4 - Date & Time',
  [WIZARD_STEPS.CONFIRMATION]: 'Step 4 of 4 - Confirmation',
};

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'X-Large' },
];

const SOIL_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

export function renderContact() {
  const serviceOptions = Object.keys(BASE_PRICES)
    .map((service) => `<option value="${service}">${service}</option>`)
    .join('');
  const sizeOptions = SIZE_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
  const soilOptions = SOIL_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');

  return `
    <section class="hero">
      <img src="/images/clean_sofa.webp" alt="Clean Sofa">
      <div class="hero-text">
        <p>"Cleaning that renews, upholstery that enchants!"</p>
      </div>
    </section>

    <main class="page-contact">
      <h1>Contact and Scheduling</h1>
      <p class="service-area-notice">
        We exclusively serve the cities of Canoas, Porto Alegre, and Esteio.
      </p>
      <div id="recovery-banner" class="recovery-banner" style="display:none;" role="alert">
        Welcome back! We restored your previous booking progress.
      </div>

      <section class="booking-wizard" aria-labelledby="wizard-title">
        <h2 id="wizard-title">Booking Wizard</h2>
        <p id="wizard-step-label" class="wizard-step-label"></p>
        <div class="wizard-progress" aria-hidden="true">
          <div id="wizard-progress-bar" class="wizard-progress__bar"></div>
        </div>

        <section class="wizard-step" data-step="1">
          <h3>Select service items</h3>
          <div class="wizard-row">
            <div>
              <label for="serviceType">Service</label>
              <select id="serviceType">${serviceOptions}</select>
            </div>
            <div>
              <label for="serviceSize">Size</label>
              <select id="serviceSize">${sizeOptions}</select>
            </div>
            <div>
              <label for="soilDepth">Soil level</label>
              <select id="soilDepth">${soilOptions}</select>
            </div>
          </div>
          <button id="add-service-item" type="button" class="confirm">Add Item</button>
          <ul id="selected-items" class="selected-items"></ul>

          <div class="quote-summary">
            <label for="distanceKm">Distance from HQ (km)</label>
            <input id="distanceKm" type="number" min="0" step="0.1">
            <p>Subtotal: <strong id="quote-subtotal">${formatCurrency(0)}</strong></p>
            <p>Distance fee: <strong id="quote-distance-fee">${formatCurrency(0)}</strong></p>
            <p>Total: <strong id="quote-total">${formatCurrency(0)}</strong></p>
          </div>
        </section>

        <section class="wizard-step" data-step="2" hidden>
          <h3>Address validation</h3>
          <div class="address-fields">
            <label for="zipCode">ZIP Code</label>
            <div class="cep-row">
              <input type="text" id="zipCode" inputmode="numeric" maxlength="9" placeholder="00000-000">
              <button id="lookup-cep" type="button" class="confirm">Search ZIP Code</button>
            </div>
            <label for="address">Street</label>
            <input type="text" id="address">
            <label for="number">Number</label>
            <input type="text" id="number">
            <label for="neighborhood">Neighborhood</label>
            <input type="text" id="neighborhood">
            <label for="city">City</label>
            <input type="text" id="city">
          </div>
        </section>

        <section class="wizard-step" data-step="3" hidden>
          <h3>Date and customer info</h3>
          <div class="address-fields">
            <label for="name">Name</label>
            <input type="text" id="name">
            <label for="email">Email</label>
            <input type="email" id="email">
            <label for="phone">Phone</label>
            <input type="tel" id="phone">
            <label for="date">Date</label>
            <input type="date" id="date">
            <label for="time">Time</label>
            <input type="time" id="time">
          </div>
        </section>

        <section class="wizard-step" data-step="4" hidden>
          <h3>Confirmation</h3>
          <div id="booking-summary" class="booking-summary"></div>
        </section>

        <div class="wizard-actions">
          <button id="wizard-prev" type="button" class="confirm-prev">Back</button>
          <button id="wizard-next" type="button" class="confirm-next">Next</button>
          <button id="submit-booking" type="button" class="submit-btn">Submit Booking</button>
        </div>

        <p id="form-feedback" class="form-feedback" aria-live="polite"></p>
      </section>
    </main>
  `;
}

export function initContact() {
  let state = loadBookingDraft();

  if (hasRecoverableDraft(state)) {
    const banner = document.getElementById('recovery-banner');
    if (banner) banner.style.display = 'block';
  }

  populateFieldsFromState(state);
  updateWizardUI(state);

  document.getElementById('add-service-item')?.addEventListener('click', () => {
    const service = getInputValue('serviceType');
    const size = getInputValue('serviceSize');
    const soilDepth = getInputValue('soilDepth');
    if (!service || !size || !soilDepth) {
      showFeedback('Please complete service, size, and soil level.', 'error');
      return;
    }

    const items = [...state.items, { service, size, soilDepth }];
    const quote = calculateQuote(items, state.distanceKm);
    state = updateBookingState(state, { items, quote });
    updateWizardUI(state);
    showFeedback('Service item added.', 'success');
  });

  document.getElementById('selected-items')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-index]');
    if (!button) return;

    const index = Number(button.dataset.removeIndex);
    if (!Number.isInteger(index)) return;

    const items = state.items.filter((_item, itemIndex) => itemIndex !== index);
    const quote = items.length ? calculateQuote(items, state.distanceKm) : null;
    state = updateBookingState(state, { items, quote });
    updateWizardUI(state);
  });

  document.querySelector('.booking-wizard')?.addEventListener('input', (event) => {
    state = syncStateFromForm(state);
    if (event.target.id === 'zipCode') {
      const formatted = formatCep(getInputValue('zipCode'));
      setInputValue('zipCode', formatted);
      state = updateBookingState(state, { address: { zipCode: formatted } });
    }
    if (event.target.id === 'distanceKm') {
      updateQuoteSummary(state.quote);
    }
  });

  document.getElementById('lookup-cep')?.addEventListener('click', async () => {
    state = syncStateFromForm(state);
    state = await fillAddressFromCep(state);
  });

  document.getElementById('zipCode')?.addEventListener('blur', async () => {
    state = syncStateFromForm(state);
    const digits = getInputValue('zipCode').replace(/\D/g, '');
    if (digits.length === 8) {
      state = await fillAddressFromCep(state);
    }
  });

  document.getElementById('wizard-next')?.addEventListener('click', () => {
    state = syncStateFromForm(state);
    const result = advanceStep(state);
    state = result.state;
    if (result.errors.length) {
      showFeedback(result.errors[0], 'error');
      return;
    }
    updateWizardUI(state);
    showFeedback('', 'info');
  });

  document.getElementById('wizard-prev')?.addEventListener('click', () => {
    state = retreatStep(syncStateFromForm(state));
    updateWizardUI(state);
    showFeedback('', 'info');
  });

  document.getElementById('submit-booking')?.addEventListener('click', async () => {
    state = syncStateFromForm(state);
    const stepErrors = [
      ...validateStep(state, WIZARD_STEPS.ITEM_SELECTION),
      ...validateStep(state, WIZARD_STEPS.ADDRESS_VALIDATION),
      ...validateStep(state, WIZARD_STEPS.DATETIME_CHOICE),
    ];
    if (stepErrors.length) {
      showFeedback(stepErrors[0], 'error');
      return;
    }

    const payload = {
      name: state.customer.name,
      email: state.customer.email,
      phone: state.customer.phone,
      services: state.items.map((item) => item.service),
      date: state.date,
      time: state.time,
      zipCode: state.address.zipCode,
      address: state.address.street,
      number: state.address.number,
      neighborhood: state.address.neighborhood,
      city: state.address.city,
      items: state.items,
      quote: state.quote,
      distanceKm: state.distanceKm,
    };

    try {
      const dateTimeRange = getDateTimeRange(state.date, state.time, estimateDurationMinutes(state.items.length));
      const availability = await getCalendarAvailability(dateTimeRange);
      if (availability.isBusy) {
        showFeedback('Horario indisponivel. Escolha outro horario para agendar.', 'error');
        return;
      }

      const calendarResult = await createCalendarBooking({
        ...payload,
        start: dateTimeRange.start,
        end: dateTimeRange.end,
        fullAddress: [
          state.address.street,
          state.address.number,
          state.address.neighborhood,
          state.address.city,
          state.address.zipCode,
        ]
          .filter(Boolean)
          .join(', '),
      });

      const result = await submitContact(payload);
      showFeedback(
        result.message ?? `Booking submitted successfully! Evento criado: ${calendarResult.htmlLink ?? 'Google Calendar'}`,
        'success'
      );
      resetBookingDraft();
      clearSession('contactDraft');
      state = createBookingState();
      populateFieldsFromState(state);
      updateWizardUI(state);
      const banner = document.getElementById('recovery-banner');
      if (banner) banner.style.display = 'none';
    } catch (error) {
      showFeedback('Failed to submit. Please try again or call us directly.', 'error');
      console.error('[Contact] Submit error:', error);
    }
  });
}

function syncStateFromForm(state) {
  const distanceValue = Number(getInputValue('distanceKm') || 0);
  const distanceKm = Number.isFinite(distanceValue) ? Math.max(0, distanceValue) : 0;
  const quote = state.items.length ? calculateQuote(state.items, distanceKm) : null;

  return updateBookingState(state, {
    distanceKm,
    quote,
    address: {
      zipCode: formatCep(getInputValue('zipCode')),
      street: getInputValue('address'),
      number: getInputValue('number'),
      neighborhood: getInputValue('neighborhood'),
      city: getInputValue('city'),
    },
    customer: {
      name: getInputValue('name'),
      email: getInputValue('email'),
      phone: getInputValue('phone'),
    },
    date: getInputValue('date'),
    time: getInputValue('time'),
  });
}

function updateWizardUI(state) {
  document.querySelectorAll('.wizard-step').forEach((stepEl) => {
    const isActive = Number(stepEl.dataset.step) === state.step;
    stepEl.hidden = !isActive;
  });

  const stepLabel = document.getElementById('wizard-step-label');
  if (stepLabel) stepLabel.textContent = STEP_LABELS[state.step] ?? '';

  const progressBar = document.getElementById('wizard-progress-bar');
  if (progressBar) progressBar.style.width = `${getWizardProgress(state.step)}%`;

  const prevBtn = document.getElementById('wizard-prev');
  const nextBtn = document.getElementById('wizard-next');
  const submitBtn = document.getElementById('submit-booking');
  if (prevBtn) prevBtn.style.display = state.step > WIZARD_STEPS.ITEM_SELECTION ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.style.display = state.step < WIZARD_STEPS.CONFIRMATION ? 'inline-flex' : 'none';
  if (submitBtn) submitBtn.style.display = state.step === WIZARD_STEPS.CONFIRMATION ? 'inline-flex' : 'none';

  renderSelectedItems(state.items);
  updateQuoteSummary(state.quote);
  renderConfirmation(state);
}

function renderSelectedItems(items) {
  const listEl = document.getElementById('selected-items');
  if (!listEl) return;

  if (!items.length) {
    listEl.innerHTML = '<li>No items selected yet.</li>';
    return;
  }

  listEl.innerHTML = items
    .map(
      (item, index) => `
        <li>
          <span>${escapeHtml(item.service)} - ${escapeHtml(item.size)} - ${escapeHtml(item.soilDepth)}</span>
          <button type="button" data-remove-index="${index}" aria-label="Remove item">Remove</button>
        </li>
      `
    )
    .join('');
}

function updateQuoteSummary(quote) {
  const subtotalEl = document.getElementById('quote-subtotal');
  const distanceEl = document.getElementById('quote-distance-fee');
  const totalEl = document.getElementById('quote-total');
  if (!subtotalEl || !distanceEl || !totalEl) return;

  subtotalEl.textContent = formatCurrency(quote?.subtotal ?? 0);
  distanceEl.textContent = formatCurrency(quote?.distanceFee ?? 0);
  totalEl.textContent = formatCurrency(quote?.total ?? 0);
}

function renderConfirmation(state) {
  const summaryEl = document.getElementById('booking-summary');
  if (!summaryEl) return;

  const itemLines = state.items
    .map((item) => `${item.service} (${item.size}, ${item.soilDepth})`)
    .join(', ');

  summaryEl.innerHTML = `
    <p><strong>Customer:</strong> ${escapeHtml(state.customer.name || '-')}</p>
    <p><strong>Email:</strong> ${escapeHtml(state.customer.email || '-')}</p>
    <p><strong>Phone:</strong> ${escapeHtml(state.customer.phone || '-')}</p>
    <p><strong>Services:</strong> ${escapeHtml(itemLines || '-')}</p>
    <p><strong>ZIP code:</strong> ${escapeHtml(state.address.zipCode || '-')}</p>
    <p><strong>Address:</strong> ${escapeHtml(
      [state.address.street, state.address.number, state.address.neighborhood, state.address.city]
        .filter(Boolean)
        .join(', ') || '-'
    )}</p>
    <p><strong>Schedule:</strong> ${escapeHtml(state.date && state.time ? `${state.date} ${state.time}` : '-')}</p>
    <p><strong>Quote total:</strong> ${formatCurrency(state.quote?.total ?? 0)}</p>
  `;
}

function populateFieldsFromState(state) {
  setInputValue('distanceKm', state.distanceKm ? String(state.distanceKm) : '');
  setInputValue('zipCode', state.address.zipCode);
  setInputValue('address', state.address.street);
  setInputValue('number', state.address.number);
  setInputValue('neighborhood', state.address.neighborhood);
  setInputValue('city', state.address.city);
  setInputValue('name', state.customer.name);
  setInputValue('email', state.customer.email);
  setInputValue('phone', state.customer.phone);
  setInputValue('date', state.date);
  setInputValue('time', state.time);
}

function hasRecoverableDraft(state) {
  return !!(
    state.items.length
    || state.customer.name
    || state.customer.email
    || state.address.zipCode
    || state.address.street
    || state.date
    || state.time
  );
}

async function fillAddressFromCep(state) {
  const zipCode = formatCep(state.address.zipCode || getInputValue('zipCode'));
  const digits = zipCode.replace(/\D/g, '');
  if (digits.length !== 8) {
    showFeedback('Enter a valid 8-digit postal code.', 'error');
    return state;
  }

  try {
    const address = await fetchAddressByCep(digits);
    const nextState = updateBookingState(state, {
      address: {
        zipCode,
        street: address.street,
        neighborhood: address.neighborhood,
        city: address.city,
      },
    });
    setInputValue('zipCode', zipCode);
    setInputValue('address', address.street);
    setInputValue('neighborhood', address.neighborhood);
    setInputValue('city', address.city);
    showFeedback('Address automatically filled from ZIP code.', 'success');
    return nextState;
  } catch (error) {
    console.error('[Contact] ZIP code lookup error:', error);
    showFeedback('Unable to locate the provided ZIP code.', 'error');
    return updateBookingState(state, { address: { zipCode } });
  }
}

function formatCep(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function getDateTimeRange(date, time, durationMinutes) {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function estimateDurationMinutes(itemCount) {
  const safeCount = Number.isFinite(itemCount) ? Math.max(1, itemCount) : 1;
  return safeCount * 90;
}

function getInputValue(id) {
  const input = document.getElementById(id);
  if (!input) return '';
  return String(input.value ?? '').trim();
}

function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value ?? '';
}

function showFeedback(message, type = 'info') {
  const el = document.getElementById('form-feedback');
  if (!el) return;
  el.textContent = message;
  el.className = `form-feedback form-feedback--${type}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
