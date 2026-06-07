const currentYear = new Date().getFullYear();
document.getElementById("copyrightYear").textContent = currentYear;

const lastModified = document.lastModified;
document.getElementById("lastModified").textContent = lastModified;

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const closeBtn = document.querySelector('.close-menu');
    const navMenu = document.querySelector('.navigation');

    // Show dropdown menu when hamburger is clicked
    hamburger.addEventListener('click', () => {
        navMenu.classList.add('active');
        hamburger.style.display = 'none';
        closeBtn.style.display = 'block';
    });

    // Hide menu when close button is clicked
    closeBtn.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.style.display = 'block';
        closeBtn.style.display = 'none';
    });

    // Hide menu and close button on large screens
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            navMenu.classList.remove('active');
            hamburger.style.display = 'none';
            closeBtn.style.display = 'none';
        } else {
            hamburger.style.display = navMenu.classList.contains('active') ? 'none' : 'block';
            closeBtn.style.display = navMenu.classList.contains('active') ? 'block' : 'none';
        }
    });

    // Initialize display based on screen size
    if (window.innerWidth > 900) {
        hamburger.style.display = 'none';
        closeBtn.style.display = 'none';
    } else {
        hamburger.style.display = navMenu.classList.contains('active') ? 'none' : 'block';
        closeBtn.style.display = navMenu.classList.contains('active') ? 'block' : 'none';
    }
});