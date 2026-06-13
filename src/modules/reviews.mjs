import { loadSession, saveSession } from './storage.mjs';

const REVIEWS_KEY = 'reviews';
const MAX_REVIEWS = 20;

const DEFAULT_REVIEWS = [
  {
    name: 'Mariana Costa',
    rating: 5,
    comment: 'Excellent service and very fast scheduling. My sofa looks brand new.',
    date: '2026-05-22T10:00:00.000Z',
    verified: true,
  },
  {
    name: 'Felipe Almeida',
    rating: 5,
    comment: 'Great communication and punctual team. I will hire again.',
    date: '2026-05-18T14:30:00.000Z',
    verified: true,
  },
];

export function renderReviewHub() {
  return `
    <section class="review-hub" aria-labelledby="review-hub-title">
      <h2 id="review-hub-title">Customer Review Hub</h2>
      <p>Verified reviews and new ratings from recent clients.</p>
      <div id="review-list" class="review-list"></div>
      <form id="review-form" class="review-form" novalidate>
        <h3>Share your experience</h3>
        <label for="review-name">Name</label>
        <input id="review-name" name="name" type="text" required />

        <label for="review-rating">Rating (1 to 5)</label>
        <input id="review-rating" name="rating" type="number" min="1" max="5" required />

        <label for="review-comment">Comment</label>
        <textarea id="review-comment" name="comment" rows="4" required></textarea>

        <button type="submit">Submit Review</button>
        <p id="review-feedback" class="review-feedback" aria-live="polite"></p>
      </form>
    </section>
  `;
}

export function initReviewHub() {
  const listEl = document.getElementById('review-list');
  const formEl = document.getElementById('review-form');
  const feedbackEl = document.getElementById('review-feedback');
  if (!listEl || !formEl || !feedbackEl) return;

  const reviews = getReviews();
  renderReviews(listEl, reviews);

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(formEl);
    const name = String(formData.get('name') ?? '').trim();
    const comment = String(formData.get('comment') ?? '').trim();
    const rating = Number(formData.get('rating'));

    if (!name || !comment || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      feedbackEl.className = 'review-feedback review-feedback--error';
      feedbackEl.textContent = 'Please fill all review fields with valid values.';
      return;
    }

    const updatedReviews = addReview({
      name,
      comment,
      rating,
      date: new Date().toISOString(),
      verified: false,
    });

    renderReviews(listEl, updatedReviews);
    feedbackEl.className = 'review-feedback review-feedback--success';
    feedbackEl.textContent = 'Review submitted successfully.';
    formEl.reset();
  });
}

function getReviews() {
  const saved = loadSession(REVIEWS_KEY);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  saveSession(REVIEWS_KEY, DEFAULT_REVIEWS);
  return DEFAULT_REVIEWS;
}

function addReview(review) {
  const current = getReviews();
  const updated = [review, ...current].slice(0, MAX_REVIEWS);
  saveSession(REVIEWS_KEY, updated);
  return updated;
}

function renderReviews(listEl, reviews) {
  if (!reviews.length) {
    listEl.innerHTML = '<p>No reviews yet.</p>';
    return;
  }

  listEl.innerHTML = reviews
    .map((review) => {
      const stars = '★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 1)));
      const date = new Date(review.date).toLocaleDateString();
      const badge = review.verified ? '<span class="review-badge">Verified</span>' : '';

      return `
        <article class="review-card">
          <header>
            <strong>${escapeHtml(review.name)}</strong>
            ${badge}
          </header>
          <p class="review-card__stars" aria-label="${review.rating} out of 5 stars">${stars}</p>
          <p>${escapeHtml(review.comment)}</p>
          <small>${escapeHtml(date)}</small>
        </article>
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
