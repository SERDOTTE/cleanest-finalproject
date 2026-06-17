/**
 * Returns the clean HTML structure of the footer.
 * @returns {string} HTML Template string
 */
export function renderFooter() {
  return `
    <div class="limpa__contact">
      <h3>CleanNest</h3>
      <p>1234 Main St, Canoas, RS</p>
      <p>Zip Code: 12345-678</p>
      <p>contato@cleannest.com.br</p>
      <p>(51) 1234-5678</p>
    </div>
    <div class="social__contact">
      <h3>Follow Us</h3>
      <div class="social-icons">
        <a href="#"><img src="/images/facebook_icon.png" alt="Facebook" class="icon" /></a>
        <a href="#"><img src="/images/insta_icon.png" alt="Instagram" class="icon" /></a>
        <a href="#"><img src="/images/twitter_icon.png" alt="Twitter" class="icon" /></a>
      </div>
    </div>
    <div class="author__info">
      <p>WDD330 Final Project</p>
      <p>Rodrigo Serdotte Freitas</p>
      <p>&copy;<span id="copyrightYear"></span> CleanNest</p>
    </div>
  `;
}

/**
 * Initializes dynamic footer logic and data (such as the current year).
 */
export function initFooter() {
  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}