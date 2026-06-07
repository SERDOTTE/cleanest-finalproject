import { submitContact } from '../modules/api.mjs';
import { saveSession, loadSession, clearSession } from '../modules/storage.mjs';

const SERVICE_OPTIONS = [
  'Waterproofing',
  'Sofa Cleaning',
  'Mattress Cleaning',
  'Internal Cleaning of automobiles',
  'Leather Hydration',
  'Carpet Cleaning',
];

export function renderContact() {
  const checkboxes = SERVICE_OPTIONS.map(
    (s) => `<label><input type="checkbox" name="service" value="${s}"> ${s}</label><br>`
  ).join('');

  return `
    <section class="hero">
      <img src="/images/clean_sofa.webp" alt="Clean Sofa">
      <div class="hero-text">
        <p>"Cleaning that renews, upholstery that enchants!"</p>
      </div>
    </section>
    <main class="page-contact">
      <h1>Contact and Scheduling</h1>
      <div id="recovery-banner" class="recovery-banner" style="display:none;" role="alert">
        Welcome back! We restored your previous information.
      </div>
      <div class="contact-container">
        <div class="contact-form">
          <form id="contactForm" novalidate>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone">

            <p>Services:</p>
            <div>${checkboxes}</div>
          </form>
          <div id="form-feedback" class="form-feedback" aria-live="polite"></div>
        </div>

        <div class="contact-schedule">
          <h2>Schedule our visit</h2>
          <p>Select the day and enter the time:</p>
          <div class="date-time-container">
            <label for="date">Date:</label>
            <input type="date" id="date" name="date">
            <label for="time">Time:</label>
            <input type="time" id="time" name="time">
            <button class="confirm" type="button">Confirm Date &amp; Time</button>
            <div id="confirmed-slot" class="confirmed-slot" aria-live="polite"></div>
          </div>

          <h3>Address</h3>
          <label for="address">Street:</label>
          <input type="text" id="address" name="address" form="contactForm">
          <label for="number">Number:</label>
          <input type="text" id="number" name="number" form="contactForm">
          <label for="neighborhood">Neighborhood:</label>
          <input type="text" id="neighborhood" name="neighborhood" form="contactForm">
          <label for="city">City:</label>
          <input type="text" id="city" name="city" form="contactForm">
        </div>
      </div>

      <button type="button" class="submit-btn">Submit</button>
    </main>
  `;
}

export function initContact() {
  let confirmedDate = '';
  let confirmedTime = '';

  // Restore abandoned draft
  const draft = loadSession('contactDraft');
  if (draft) {
    const form = document.getElementById('contactForm');
    if (form) {
      if (draft.name)  form.name.value  = draft.name;
      if (draft.email) form.email.value = draft.email;
      if (draft.phone) form.phone.value = draft.phone;
      const banner = document.getElementById('recovery-banner');
      if (banner) banner.style.display = 'block';
    }
  }

  // Auto-save draft on input
  document.getElementById('contactForm')?.addEventListener('input', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;
    saveSession('contactDraft', {
      name:  form.name.value,
      email: form.email.value,
      phone: form.phone.value,
    });
  });

  // Confirm date/time
  document.querySelector('.confirm')?.addEventListener('click', () => {
    confirmedDate = document.getElementById('date')?.value ?? '';
    confirmedTime = document.getElementById('time')?.value ?? '';
    const slotEl  = document.getElementById('confirmed-slot');
    if (confirmedDate && confirmedTime) {
      if (slotEl) slotEl.textContent = `Confirmed: ${confirmedDate} at ${confirmedTime}`;
    } else {
      showFeedback('Please select both date and time.', 'error');
    }
  });

  // Submit
  document.querySelector('.submit-btn')?.addEventListener('click', async () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    if (!form.name.value.trim() || !form.email.value.trim()) {
      showFeedback('Name and email are required.', 'error');
      return;
    }

    const payload = {
      name:         form.name.value.trim(),
      email:        form.email.value.trim(),
      phone:        form.phone.value.trim(),
      services:     [...form.querySelectorAll('input[name="service"]:checked')].map((cb) => cb.value),
      date:         confirmedDate || document.getElementById('date')?.value || '',
      time:         confirmedTime || document.getElementById('time')?.value || '',
      address:      document.getElementById('address')?.value.trim()      || '',
      number:       document.getElementById('number')?.value.trim()       || '',
      neighborhood: document.getElementById('neighborhood')?.value.trim() || '',
      city:         document.getElementById('city')?.value.trim()         || '',
    };

    try {
      const result = await submitContact(payload);
      showFeedback(result.message ?? 'Booking submitted successfully!', 'success');
      form.reset();
      clearSession('contactDraft');
      confirmedDate = '';
      confirmedTime = '';
      const slotEl = document.getElementById('confirmed-slot');
      if (slotEl) slotEl.textContent = '';
      const banner = document.getElementById('recovery-banner');
      if (banner) banner.style.display = 'none';
    } catch (err) {
      showFeedback('Failed to submit. Please try again or call us directly.', 'error');
      console.error('[Contact] Submit error:', err);
    }
  });
}

function showFeedback(message, type = 'info') {
  const el = document.getElementById('form-feedback');
  if (!el) return;
  el.textContent  = message;
  el.className    = `form-feedback form-feedback--${type}`;
}
