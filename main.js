/* ============================================================
   TEXSENSS — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. STICKY HEADER — add .scrolled after 20px
  ============================================================ */
  const header = $('header.site');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ============================================================
     2. MOBILE NAV DROPDOWN — animated open/close
  ============================================================ */
  const navToggle = $('#navToggle');
  const navLinks  = $('#navLinks');

  if (navToggle && navLinks) {
    const open = () => {
      navLinks.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => navLinks.classList.contains('open') ? close() : open();

    navToggle.addEventListener('click', toggle);

    // Close on link click
    $$('a', navLinks).forEach(a => a.addEventListener('click', close));

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        close();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ============================================================
     3. ACTIVE NAV LINK — highlight section in view
  ============================================================ */
  const sections = $$('section[id]');
  const navAnchors = $$('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => {
            const target = a.getAttribute('href').slice(1);
            a.classList.toggle('active', target === entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => navIO.observe(s));
  }

  /* ============================================================
     4. UNIFIED SCROLL REVEAL (IntersectionObserver)
  ============================================================ */
  const revealEls = $$('.reveal, .reveal-left, .reveal-scale, .reveal-group');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealEls.forEach(el => revealIO.observe(el));
  }

  /* ============================================================
     5. DYNAMIC SCROLL EFFECTS (Parallax, Progress & Hero Fade)
  ============================================================ */
  if (!prefersReduced) {
    // 5a. Scroll progress indicator injection & update
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    const blueprint = $('.blueprint');
    const heroInner = $('.hero-inner');
    const scrollCue = $('.hero-scroll-cue');

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Update progress bar width
      if (docHeight > 0) {
        const pct = (scrolled / docHeight) * 100;
        progressBar.style.width = `${pct}%`;
      }

      // Parallax shift for blueprint grid backdrop
      if (blueprint) {
        blueprint.style.transform = `translateY(${scrolled * 0.14}px)`;
      }

      // Parallax fade-out & lift for hero contents
      if (heroInner) {
        const opacity = Math.max(0, 1 - scrolled / 380);
        const yOffset = scrolled * 0.16;
        heroInner.style.opacity = opacity;
        heroInner.style.transform = `translateY(${yOffset}px)`;
      }

      // Fade scroll cue immediately when user scrolls
      if (scrollCue) {
        if (scrolled > 40) {
          scrollCue.style.opacity = '0';
          scrollCue.style.pointerEvents = 'none';
        } else {
          scrollCue.style.opacity = '1';
          scrollCue.style.pointerEvents = 'auto';
        }
      }
    }, { passive: true });
  }

  /* ============================================================
     7. CONTACT FORM — submission handler
  ============================================================ */
  const form    = $('#contactForm');
  const success = $('#formSuccess');

  if (form && success) {
    const btn = $('[type="submit"]', form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Loading state
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      // --- Replace the block below with a real fetch() to your endpoint ---
      await new Promise(r => setTimeout(r, 800)); // simulate network delay

      // TODO: send to backend:
      // await fetch('https://formspree.io/f/YOUR_ID', {
      //   method: 'POST',
      //   body: new FormData(form),
      //   headers: { Accept: 'application/json' }
      // });
      // -----------------------------------------------------------------------

      success.classList.add('show');
      form.reset();

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Send message';
      }
    });
  }

  /* ============================================================
     8. HERO EYEBROW — fade-in on load
  ============================================================ */
  const eyebrow = $('.hero .eyebrow');
  if (eyebrow && !prefersReduced) {
    eyebrow.style.opacity = '0';
    eyebrow.style.transform = 'translateY(10px)';
    eyebrow.style.transition = 'opacity 0.6s var(--ease), transform 0.6s var(--ease)';
    requestAnimationFrame(() => {
      setTimeout(() => {
        eyebrow.style.opacity = '1';
        eyebrow.style.transform = 'none';
      }, 120);
    });
  }

})();
