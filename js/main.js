console.log('✅ main.js loaded'); // We'll check for this in console

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ready');

    /* HAMBURGER MENU */
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('Hamburger button found:', menuToggle);
    console.log('Nav links found:', navLinks);

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🍔 Hamburger clicked!');
            navLinks.classList.toggle('active');
            console.log('Menu is now:', navLinks.classList.contains('active') ? 'OPEN' : 'CLOSED');
            
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });
    } else {
        console.error('❌ Could not find hamburger or nav-links!');
    }

    /* ACCORDIONS */
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const panel = document.getElementById(button.getAttribute('aria-controls'));
            button.setAttribute('aria-expanded', !isExpanded);
            if (panel) panel.setAttribute('data-open', !isExpanded);
        });
    });

    /* MOBILE DROPDOWN */
    const dropbtn = document.querySelector('.dropbtn');
    if (dropbtn) {
        dropbtn.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                e.preventDefault();
                const content = dropbtn.parentElement.querySelector('.dropdown-content');
                if (content) content.classList.toggle('mobile-open');
            }
        });
    }
});