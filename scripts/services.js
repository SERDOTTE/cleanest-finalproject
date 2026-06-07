import { services } from "../data/services-list.mjs";

const showHere = document.getElementById('services-list');

// Função para criar o modal (apenas uma vez)
function createModal() {
  if (document.getElementById('service-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'service-modal';
  modal.className = 'service-modal';
  modal.innerHTML = `
    <div class="service-modal-content">
      <span class="service-modal-close" title="Close">&times;</span>
      <h2 id="modal-service-title"></h2>
      <p id="modal-service-desc"></p>
    </div>
  `;
  document.body.appendChild(modal);

  // Fechar ao clicar no X ou fora do conteúdo
  modal.querySelector('.service-modal-close').onclick = () => modal.style.display = 'none';
  modal.onclick = e => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

function showModal(name, desc) {
  createModal();
  document.getElementById('modal-service-title').textContent = name;
  document.getElementById('modal-service-desc').textContent = desc;
  document.getElementById('service-modal').style.display = 'flex';
}

function displayServices(services) {
  services.filter(service => service && service.name).forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';

    const img = document.createElement('img');
    img.src = `images/${service.photo_link}`;
    img.alt = service.name;
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => showModal(service.name, service.description));

    const h2 = document.createElement('h2');
    h2.textContent = service.name;

    card.appendChild(img);
    card.appendChild(h2);

    showHere.appendChild(card);
  });
}

if (showHere) {
  displayServices(services);
}