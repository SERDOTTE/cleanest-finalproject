/**
 * Returns the clean HTML structure of the header
* @returns {string} HTML Template string
 */
export function renderHeader() {
  return `
    <div class="header__container__limpa">
      <div class="header__limpa">
        <a href="#home" data-route="home">
          <img class="logo" src="/images/logo - Editado.jpg" alt="CleanNest Logo" />
        </a>
        <div class="header__limpa_fone">
          <img src="/images/phone__icon.jpg" alt="Phone Icon" />
          <div class="header__limpa_text">
            <p>Give us a call</p>
            <p>(51) 1234-5678</p>
          </div>
        </div>
        <div class="header__limpa_email">
          <img src="/images/email__icon.png" alt="Email Icon" />
          <div class="header__limpa_text">
            <p>Send us an email</p>
            <p>contato@cleannest.com.br</p>
          </div>
        </div>
      </div>
      
      <div class="header__limpa-actions">
        <nav id="site-nav">
          <ul class="navigation">
            <li><a href="#home" data-route="home">Home</a></li>
            <li><a href="#services" data-route="services">Services</a></li>
            <li><a href="#about" data-route="about">About Us</a></li>
            <li><a href="#contact" data-route="contact">Contact &amp; Scheduling</a></li>
            <li><a href="#admin" data-route="admin">Admin Panel</a></li>
          </ul>
        </nav>
        <button class="hamburger-menu" aria-label="Toggle Menu">&#9776;</button>
        <button class="theme-toggle-btn" aria-label="Toggle Theme">&#x1F319;</button>
      </div>
    </div>
  `;
}

/**
 * Initialize the behaviors and events of the hamburger menu in the Header
 */
export function initHeader() {
  const hamburgerBtn = document.querySelector('.hamburger-menu');
  const navigation = document.querySelector('.navigation');
  const navLinks = document.querySelectorAll('.navigation a');

  if (!hamburgerBtn || !navigation) {
    console.warn('[Header] Necessary elements were not found in the DOM.');
    return;
  }

  // Toggle mobile menu open and close
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigation.classList.toggle('active');
    
    if (navigation.classList.contains('active')) {
      hamburgerBtn.innerHTML = '&times;'; // Close Icon (X)
    } else {
      hamburgerBtn.innerHTML = '&#9776;'; // Hamburger Icon
    }
  });

  // Close the menu when clicking on any link (important for SPA)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navigation.classList.contains('active')) {
        navigation.classList.remove('active');
        hamburgerBtn.innerHTML = '&#9776;';
      }
    });
  });

  // Close the menu if the user clicks anywhere outside of it
  document.addEventListener('click', (e) => {
    if (navigation.classList.contains('active') && !navigation.contains(e.target) && e.target !== hamburgerBtn) {
      navigation.classList.remove('active');
      hamburgerBtn.innerHTML = '&#9776;';
    }
  });
}