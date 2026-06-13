import { renderReviewHub, initReviewHub } from '../modules/reviews.mjs';

export function renderHome() {
  return `
    <section class="hero">
      <img src="/images/clean_sofa.webp" alt="Clean Sofa">
      <div class="hero-text">
        <p>"Cleaning that renews, upholstery that enchants!"</p>
        <a href="#contact" data-route="contact" class="cta-button">Contact Now</a>
      </div>
    </section>
    <main class="page-home">
      <h1>Welcome to CleanNest</h1>
      <div class="home__container">
        <div class="home__container_content">
          <img src="/images/limpando01.webp" alt="Clean Sofa">
          <div class="home__container_content_text">
            <h2>The importance of keeping sofas, mattresses and upholstery clean and sanitized</h2>
            <p>Keeping sofas, mattresses and upholstery properly clean and sanitized goes far beyond aesthetics: it is a matter of health and well-being. Over time, these items accumulate dust, mites, fungi, bacteria and even animal hair, which can trigger allergies, respiratory crises and other health problems. A clean environment directly contributes to a healthier, more comfortable and pleasant home. In addition, frequent cleaning extends the lifespan of upholstery and prevents bad odors caused by deep dirt that is often not visible to the naked eye.</p>
          </div>
        </div>
        <div class="home__container_content">
          <div class="home__container_content_text">
            <h2>Why choose CleanNest?</h2>
            <p>To ensure truly effective and long-lasting cleaning, it is essential to use professional and approved equipment with cutting-edge technology. Our company invests in the most modern equipment on the market: powerful extractors, industrial steamers, specific brushes for delicate fabrics and safe, biodegradable products that eliminate microorganisms without damaging the upholstery material. All of this guarantees superior, deep and long-lasting results, restoring your furniture's new look.</p>
          </div>
          <img src="/images/limpando02.webp" alt="Cleaning Service">
        </div>
        <div class="home__container_content">
          <img src="/images/limpando03.webp" alt="Cleaning Equipment">
          <div class="home__container_content_text">
            <h2>Specialized service and satisfaction guarantee</h2>
            <p>Our commitment goes beyond cleaning. We offer personalized service, focused on understanding the specific needs of each client. Each service is performed with responsibility, care and total transparency — with a guarantee of quality and satisfaction. We want to provide a unique experience: that you feel the peace of mind and pleasure of having a clean, sanitized and welcoming home.</p>
          </div>
        </div>
      </div>
      ${renderReviewHub()}
    </main>
  `;
}

export function initHome() {
  initReviewHub();
}
