/**
 * Srijit Paul - Developer Portfolio
 * Vanilla JavaScript Engine
 * - Dynamic Theme Switcher
 * - Accessible Contact Form Validation & Async Simulation
 * - Interactive Testimonials Carousel (Auto-play, Touch, Dots, ARIA)
 * - Navigation ScrollSpy (IntersectionObserver)
 * - Mobile Drawer Menu Toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. Theme Switcher (Dark / Light Mode)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('srijit_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  htmlRoot.setAttribute('data-theme', initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('srijit_theme', newTheme);
    });
  }

  // =========================================================================
  // 2. Mobile Drawer Navigation
  // =========================================================================
  const menuToggleBtn = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggleBtn && navMenu) {
    menuToggleBtn.addEventListener('click', () => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      menuToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      menuToggleBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when any navigation link is clicked
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        menuToggleBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggleBtn.contains(e.target) && navMenu.classList.contains('active')) {
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        menuToggleBtn.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 3. ScrollSpy Navigation (IntersectionObserver)
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // =========================================================================
  // 4. Testimonials Carousel
  // =========================================================================
  const track = document.getElementById('carousel-track');
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = Array.from(document.querySelectorAll('.dot-btn'));
  const carouselContainer = document.getElementById('testimonials-carousel');

  let currentSlideIndex = 0;
  let autoplayTimer = null;
  const autoplayInterval = 6000;

  function updateCarousel(index) {
    if (!track || slides.length === 0) return;
    
    // Bounds check with cyclic wrap
    if (index < 0) {
      currentSlideIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentSlideIndex = 0;
    } else {
      currentSlideIndex = index;
    }

    // Move track
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    // Update active classes for slides & accessibility
    slides.forEach((slide, idx) => {
      const isActive = idx === currentSlideIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    // Update dots
    dots.forEach((dot, idx) => {
      const isActive = idx === currentSlideIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  function nextSlide() {
    updateCarousel(currentSlideIndex + 1);
  }

  function prevSlide() {
    updateCarousel(currentSlideIndex - 1);
  }

  if (track && slides.length > 0) {
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        updateCarousel(index);
        resetAutoplay();
      });
    });

    // Touch Swipe Support
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    // Keyboard support
    carouselContainer?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      }
    });

    // Autoplay routines with hover pause
    function startAutoplay() {
      if (!autoplayTimer) {
        autoplayTimer = setInterval(nextSlide, autoplayInterval);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    carouselContainer?.addEventListener('mouseenter', stopAutoplay);
    carouselContainer?.addEventListener('mouseleave', startAutoplay);

    // Initial setup
    updateCarousel(0);
    startAutoplay();
  }

  // =========================================================================
  // 5. Contact Form Real-Time & Submit Validation
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');
  const formAlert = document.getElementById('form-alert');

  // Strict email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function setFieldError(input, errorElementId, message) {
    const group = input.closest('.form-group');
    const errorEl = document.getElementById(errorElementId);
    
    if (group) {
      group.classList.remove('has-success');
      group.classList.add('has-error');
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function setFieldSuccess(input, errorElementId) {
    const group = input.closest('.form-group');
    const errorEl = document.getElementById(errorElementId);

    if (group) {
      group.classList.remove('has-error');
      group.classList.add('has-success');
    }
    if (errorEl) {
      errorEl.textContent = '';
    }
  }

  function validateName() {
    if (!nameInput) return true;
    const val = nameInput.value.trim();
    if (val === '') {
      setFieldError(nameInput, 'name-error', 'Please enter your full name.');
      return false;
    }
    if (val.length < 2) {
      setFieldError(nameInput, 'name-error', 'Name must be at least 2 characters.');
      return false;
    }
    setFieldSuccess(nameInput, 'name-error');
    return true;
  }

  function validateEmail() {
    if (!emailInput) return true;
    const val = emailInput.value.trim();
    if (val === '') {
      setFieldError(emailInput, 'email-error', 'Email address is required.');
      return false;
    }
    if (!emailRegex.test(val)) {
      setFieldError(emailInput, 'email-error', 'Please enter a valid email (e.g. name@domain.com).');
      return false;
    }
    setFieldSuccess(emailInput, 'email-error');
    return true;
  }

  function validateSubject() {
    if (!subjectInput) return true;
    const val = subjectInput.value.trim();
    if (val === '') {
      setFieldError(subjectInput, 'subject-error', 'Please specify a subject.');
      return false;
    }
    if (val.length < 3) {
      setFieldError(subjectInput, 'subject-error', 'Subject must be at least 3 characters.');
      return false;
    }
    setFieldSuccess(subjectInput, 'subject-error');
    return true;
  }

  function validateMessage() {
    if (!messageInput) return true;
    const val = messageInput.value.trim();
    if (val === '') {
      setFieldError(messageInput, 'message-error', 'Please enter a message.');
      return false;
    }
    if (val.length < 10) {
      setFieldError(messageInput, 'message-error', 'Message should be at least 10 characters.');
      return false;
    }
    setFieldSuccess(messageInput, 'message-error');
    return true;
  }

  // Live input events for instantaneous user feedback
  if (nameInput) {
    nameInput.addEventListener('input', validateName);
    nameInput.addEventListener('blur', validateName);
  }
  if (emailInput) {
    emailInput.addEventListener('input', validateEmail);
    emailInput.addEventListener('blur', validateEmail);
  }
  if (subjectInput) {
    subjectInput.addEventListener('input', validateSubject);
    subjectInput.addEventListener('blur', validateSubject);
  }
  if (messageInput) {
    messageInput.addEventListener('input', validateMessage);
    messageInput.addEventListener('blur', validateMessage);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Trigger all validations
      const isNameValid = validateName();
      const isEmailValid = validateEmail();
      const isSubjectValid = validateSubject();
      const isMessageValid = validateMessage();

      const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

      if (!isFormValid) {
        // Focus the first invalid field
        if (!isNameValid) nameInput?.focus();
        else if (!isEmailValid) emailInput?.focus();
        else if (!isSubjectValid) subjectInput?.focus();
        else if (!isMessageValid) messageInput?.focus();

        if (formAlert) {
          formAlert.className = 'form-alert alert-error';
          formAlert.textContent = 'Please fix the highlighted errors above before transmitting.';
          formAlert.setAttribute('aria-hidden', 'false');
        }
        return;
      }

      // If valid, simulate async submission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }

      if (formAlert) {
        formAlert.className = 'form-alert';
        formAlert.style.display = 'none';
        formAlert.setAttribute('aria-hidden', 'true');
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }

        if (formAlert) {
          formAlert.className = 'form-alert alert-success';
          formAlert.style.display = 'block';
          formAlert.textContent = '🎉 Thank you! Your message has been transmitted successfully to Srijit Paul. I will get back to you shortly.';
          formAlert.setAttribute('aria-hidden', 'false');
        }

        // Reset form fields
        contactForm.reset();
        [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
          input?.closest('.form-group')?.classList.remove('has-success', 'has-error');
        });

        // Hide success alert after 8 seconds
        setTimeout(() => {
          if (formAlert) {
            formAlert.style.display = 'none';
            formAlert.setAttribute('aria-hidden', 'true');
          }
        }, 8000);
      }, 1200);
    });
  }

  // =========================================================================
  // 6. Dynamic Year in Footer
  // =========================================================================
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
});
