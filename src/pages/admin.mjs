import { getSubmissions } from '../modules/api.mjs';

export function renderAdmin() {
  return `
    <section class="hero">
      <img src="/images/clean_sofa.webp" alt="Clean Sofa">
      <div class="hero-text">
        <p>"Owner dashboard for incoming scheduling requests"</p>
      </div>
    </section>

    <main class="page-admin">
      <h1>Admin Panel</h1>
      <p class="admin-subtitle">Monitor recent scheduling requests and customer details.</p>

      <section class="admin-stats" aria-label="Dashboard summary">
        <article class="admin-stat-card">
          <h2>Total Requests</h2>
          <p id="admin-total-requests">0</p>
        </article>
        <article class="admin-stat-card">
          <h2>Requests With Date</h2>
          <p id="admin-dated-requests">0</p>
        </article>
        <article class="admin-stat-card">
          <h2>Unique Cities</h2>
          <p id="admin-unique-cities">0</p>
        </article>
      </section>

      <section class="admin-table-wrap" aria-label="Scheduling requests">
        <h2>Recent Requests</h2>
        <div id="admin-feedback" class="form-feedback form-feedback--info" aria-live="polite"></div>
        <div class="admin-table-scroll">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Services</th>
                <th>Schedule</th>
                <th>Address</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody id="admin-submissions-body">
              <tr>
                <td colspan="7">Loading data...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

export async function initAdmin() {
  const feedbackEl = document.getElementById('admin-feedback');
  const bodyEl = document.getElementById('admin-submissions-body');

  if (!feedbackEl || !bodyEl) return;

  try {
    const submissions = await getSubmissions();
    renderSummary(submissions);
    renderRows(submissions);

    feedbackEl.className = 'form-feedback form-feedback--success';
    feedbackEl.textContent = `Loaded ${submissions.length} request(s).`;
  } catch (error) {
    feedbackEl.className = 'form-feedback form-feedback--error';
    feedbackEl.textContent = 'Failed to load admin data. Start the API with npm run server.';
    bodyEl.innerHTML = '<tr><td colspan="7">No data available.</td></tr>';
    console.error('[Admin] Failed to load submissions:', error);
  }
}

function renderSummary(submissions) {
  const totalEl = document.getElementById('admin-total-requests');
  const datedEl = document.getElementById('admin-dated-requests');
  const citiesEl = document.getElementById('admin-unique-cities');

  const datedCount = submissions.filter((item) => item.date && item.time).length;
  const uniqueCities = new Set(
    submissions
      .map((item) => (item.city || '').trim())
      .filter(Boolean)
      .map((city) => city.toLowerCase())
  ).size;

  if (totalEl) totalEl.textContent = String(submissions.length);
  if (datedEl) datedEl.textContent = String(datedCount);
  if (citiesEl) citiesEl.textContent = String(uniqueCities);
}

function renderRows(submissions) {
  const bodyEl = document.getElementById('admin-submissions-body');
  if (!bodyEl) return;

  if (!submissions.length) {
    bodyEl.innerHTML = '<tr><td colspan="7">No submissions yet.</td></tr>';
    return;
  }

  bodyEl.innerHTML = submissions
    .slice()
    .reverse()
    .map((item) => {
      const services = Array.isArray(item.services) ? item.services.join(', ') : '';
      const schedule = item.date && item.time ? `${item.date} ${item.time}` : '-';
      const address = [item.address, item.number, item.neighborhood, item.city]
        .filter(Boolean)
        .join(', ');
      const received = item.receivedAt ? new Date(item.receivedAt).toLocaleString() : '-';

      return `
        <tr>
          <td>${escapeHtml(item.name || '-')}</td>
          <td>${escapeHtml(item.email || '-')}</td>
          <td>${escapeHtml(item.phone || '-')}</td>
          <td>${escapeHtml(services || '-')}</td>
          <td>${escapeHtml(schedule)}</td>
          <td>${escapeHtml(address || '-')}</td>
          <td>${escapeHtml(received)}</td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
