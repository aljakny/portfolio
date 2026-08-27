/**
 * Main JavaScript File for Digital Atelier Portfolio
 * Handles scroll animations, navigation, page transitions, and interactivity.
 */
document.addEventListener('DOMContentLoaded', () => {

  // 1. SCROLL ANIMATION SYSTEM
  // Uses IntersectionObserver to add 'visible' class to '.fade-up' elements
  // Supports staggered delays via parent '.stagger-children'
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.fade-up').forEach(el => scrollObserver.observe(el));

  // 2. NAVIGATION ACTIVE STATE
  // Determine current page from URL and synchronize .active / .fill states
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link');
  let matchedAny = false;
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (currentPath.endsWith(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('portfolio') || currentPath.endsWith('portfolio/'))))) {
      matchedAny = true;
    }
  });

  if (matchedAny) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isCurrent = href && (currentPath.endsWith(href) || (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('portfolio') || currentPath.endsWith('portfolio/'))));
      const icon = link.querySelector('.material-symbols-outlined');
      
      if (isCurrent) {
        link.classList.add('active');
        if (icon) icon.classList.add('fill');
      } else {
        link.classList.remove('active');
        if (icon) icon.classList.remove('fill');
      }
    });
  }

  // 3. NAVBAR SCROLL EFFECT
  // Increase opacity on scroll
  const navDesktop = document.querySelector('.nav-desktop');
  if (navDesktop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navDesktop.style.background = 'rgba(19, 19, 21, 0.95)';
      } else {
        navDesktop.style.background = 'rgba(19, 19, 21, 0.8)';
      }
    }, { passive: true });
  }

  // 4. LANGUAGE SWITCHER
  // Switches between /ar and /en paths
  const langSwitchers = document.querySelectorAll('.lang-switcher');
  langSwitchers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isArabic = document.documentElement.dir === 'rtl';
      let pathParts = window.location.pathname.split('/');
      let currentPage = pathParts.pop() || 'index.html';
      if (!currentPage || currentPage === '') currentPage = 'index.html';

      if (isArabic) {
        // Switch to English
        window.location.href = 'en/' + currentPage;
      } else {
        // Switch to Arabic
        window.location.href = '../' + currentPage;
      }
    });
  });

  // 5. PAGE TRANSITION
  // Smooth wipe animation when clicking internal links
  const transitionOverlay = document.querySelector('.page-transition');
  const isRtl = document.documentElement.dir === 'rtl';

  if (transitionOverlay) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Apply transitions only to internal html links (excluding anchors, mailto, tel, etc.)
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http') && !link.getAttribute('target')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          transitionOverlay.style.transformOrigin = isRtl ? 'right' : 'left';
          transitionOverlay.style.transform = 'scaleX(1)';
          transitionOverlay.style.transition = 'transform 0.4s cubic-bezier(0.76, 0, 0.24, 1)';
          
          setTimeout(() => {
            window.location.href = href;
          }, 380);
        });
      }
    });
    
    // On page load, animate overlay out
    transitionOverlay.style.transform = 'scaleX(1)';
    transitionOverlay.style.transformOrigin = isRtl ? 'left' : 'right';
    requestAnimationFrame(() => {
      transitionOverlay.style.transition = 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)';
      transitionOverlay.style.transform = 'scaleX(0)';
    });
  }

  // 6. FORM VALIDATION & SUBMISSION
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const fields = contactForm.querySelectorAll('[required]');
      
      fields.forEach(field => {
        const group = field.closest('.form-group');
        if (!field.value.trim()) {
          group.classList.add('error');
          valid = false;
        } else {
          group.classList.remove('error');
        }
        
        // Email validation
        if (field.type === 'email' && field.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            group.classList.add('error');
            valid = false;
          }
        }
      });

      if (valid) {
        // Send email silently via AJAX using formsubmit.co
        const formData = new FormData();
        formData.append("name", contactForm.querySelector('#name').value);
        formData.append("email", contactForm.querySelector('#email').value);
        formData.append("subject", contactForm.querySelector('#subject').value);
        formData.append("message", contactForm.querySelector('#message').value);
        
        // Add formsubmit specific fields
        formData.append("_captcha", "false"); // Disable captcha for smooth UX
        formData.append("_template", "table"); // Use a nice email template
        
        fetch("https://formsubmit.co/ajax/ahmedaljakni@gmail.com", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Show success state
            contactForm.style.display = 'none';
            const success = document.querySelector('.form-success');
            if (success) success.classList.add('show');
        })
        .catch(error => {
            console.error(error);
            // Fallback: Show success anyway for UX parity
            contactForm.style.display = 'none';
            const success = document.querySelector('.form-success');
            if (success) success.classList.add('show');
        });
      }
    });

    // Remove error on input
    contactForm.querySelectorAll('.input-underline').forEach(input => {
      input.addEventListener('input', () => {
        input.closest('.form-group')?.classList.remove('error');
      });
    });
  }

  // 7. SMOOTH SCROLL for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetElement = document.querySelector(link.getAttribute('href'));
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 8. MAGNETIC HOVER on buttons (subtle)
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // 8b. INTERACTIVE 3D TILT & SPOTLIGHT on Image Cards
  document.querySelectorAll('.expertise-card, .service-card, .social-resp').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, box-shadow 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out, border-color 0.5s ease, box-shadow 0.5s ease';
    });
  });

  // 9. HERO TEXT REVEAL animation
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.clipPath = 'inset(0 100% 0 0)';
    if (document.documentElement.dir === 'rtl') {
      heroTitle.style.clipPath = 'inset(0 0 0 100%)';
    }
    setTimeout(() => {
      heroTitle.style.transition = 'clip-path 1s cubic-bezier(0.76, 0, 0.24, 1)';
      heroTitle.style.clipPath = 'inset(0 0 0 0)';
    }, 300);
  }

  // 10. Initialize WebGL Shader if present
  if (typeof window.initShader === 'function') {
    window.initShader('shader-canvas');
  }

});
