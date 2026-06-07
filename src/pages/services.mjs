import { services } from '../data/services.mjs';

export function renderServices() {
  const cards = services
    .filter((s) => s && s.name)
    .map(
      (s) => `
      <div class="service-card" data-service-id="${encodeURIComponent(s.name)}">
        <img
          class="service-card__img"
          src="/images/${s.photo_link}"
          alt="${s.name}"
        >
        <h2>${s.name}</h2>
      </div>`
    )
    .join('');

  return `
    <section class="hero">
      <img src="/images/clean_sofa.webp" alt="Clean Sofa">
      <div class="hero-text">
        <p>"Cleaning that renews, upholstery that enchants!"</p>
        <a href="#contact" data-route="contact" class="cta-button">Contact Now</a>
      </div>
    </section>
    <main class="page-services">
      <h1>Services</h1>
      <div id="services-list">${cards}</div>
    </main>
    <div id="service-modal" class="service-modal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="modal-service-title">
      <div class="service-modal-content">
        <span class="service-modal-close" role="button" tabindex="0" title="Close">&times;</span>
        <h2 id="modal-service-title"></h2>
        <p id="modal-service-desc"></p>
      </div>
    </div>
  `;
}

export function initServices() {
  const modal     = document.getElementById('service-modal');
  const titleEl   = document.getElementById('modal-service-title');
  const descEl    = document.getElementById('modal-service-desc');
  const closeBtn  = modal?.querySelector('.service-modal-close');

  if (!modal || !titleEl || !descEl) return;

  function openModal(serviceName) {
    const service = services.find((s) => s.name === serviceName);
    if (!service) return;
    titleEl.textContent = service.name;
    descEl.textContent  = service.description;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  document.querySelectorAll('.service-card__img').forEach((img) => {
    img.addEventListener('click', () => {
      const card = img.closest('.service-card');
      openModal(decodeURIComponent(card.dataset.serviceId));
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('keydown', (e) => { if (e.key === 'Enter') closeModal(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}
