/* ============================================================
   VELA COL — main.js (Glassmorphism prototype)
   GSAP + ScrollTrigger interactions, native smooth scroll
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Progressive-enhancement safety net: if GSAP failed to load, reveal
  // everything immediately instead of leaving it hidden.
  if (!hasGSAP) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------------------------------------------------------
     Header state on scroll
  --------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  navToggle.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------------------------------------------------------
     Smooth anchor scrolling
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navOffset = 90;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  /* ---------------------------------------------------------
     Back to top
  --------------------------------------------------------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Accordion (FAQ)
  --------------------------------------------------------- */
  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion-trigger').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = '';
        }
      });
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.style.maxHeight = expanded ? '' : panel.scrollHeight + 'px';
    });
  });

  /* ---------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = 0.35;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        if (hasGSAP) {
          gsap.to(el, { x: x * strength, y: y * strength, duration: 0.5, ease: 'power3.out' });
        } else {
          el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
        }
      });
      el.addEventListener('mouseleave', function () {
        if (hasGSAP) gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        else el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     3D tilt (product cards + floating hero photo card)
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var baseRotate = card.classList.contains('hero-visual-frame') ? 2.5 : 0;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        var rx = (py * -8).toFixed(2);
        var ry = (px * 10 + baseRotate).toFixed(2);
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = baseRotate
          ? 'perspective(900px) rotateX(0) rotateY(' + baseRotate + 'deg) translateY(0)'
          : 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------------------------------------------------------
     Mesh blobs: subtle mouse parallax
  --------------------------------------------------------- */
  if (!prefersReducedMotion && hasGSAP && window.matchMedia('(hover: hover)').matches) {
    var blobs = document.querySelectorAll('.blob');
    window.addEventListener('mousemove', function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      blobs.forEach(function (blob, i) {
        var depth = (i + 1) * 6;
        gsap.to(blob, { x: px * depth, y: py * depth, duration: 1.4, ease: 'power2.out' });
      });
    });
  }

  /* ---------------------------------------------------------
     GSAP timelines (guarded — page still works without GSAP)
  --------------------------------------------------------- */
  if (hasGSAP) {
    // Hero entrance is pure CSS now (see styles.css `.hero-enter` keyframes) —
    // a JS timeline animating header/photo/CTA independently of the CSS-driven
    // [data-reveal] system proved fragile (tweens could end up orphaned with
    // the target stuck at its `from` opacity:0). CSS animations always run to
    // completion on their own, no JS state to get stuck.

    // Scroll-reveal generic
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: function () { el.classList.add('is-visible'); },
        once: true,
      });
    });

    // Safety net: CSS hides every [data-reveal] element until JS adds
    // .is-visible (see critical-gotchas A.8). If a ScrollTrigger's position
    // was miscalculated — e.g. a layout shift after images/fonts settle —
    // that element would stay invisible forever. Content must never be
    // permanently hidden, so force-reveal anything still hidden after 4s.
    setTimeout(function () {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 4000);

    // (Section-head blur-reveal removed: it left titles permanently blurry
    // whenever its ScrollTrigger didn't fire — same risk class as the
    // opacity-hiding system above. Titles are readable immediately now.)

    // Product cards stagger
    ScrollTrigger.batch('.product-card', {
      start: 'top 90%',
      onEnter: function (batch) {
        gsap.from(batch, { y: 50, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
      },
      once: true,
    });

    // Benefit tiles stagger
    ScrollTrigger.batch('.benefit', {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.from(batch, { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
      },
      once: true,
    });

    // Testimonials stagger
    ScrollTrigger.batch('.testimonial', {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.from(batch, { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' });
      },
      once: true,
    });

    // Brand visual parallax
    gsap.to('.brand-visual-frame img', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.brand',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Gallery is a plain responsive grid now (no pinned/scrubbed scroll —
    // that mechanic caused real scroll-jump bugs when images loaded async).

    // Counters
    document.querySelectorAll('[data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(obj.val); },
          });
        },
      });
    });
  }

  /* ---------------------------------------------------------
     Resize handling for pinned gallery
  --------------------------------------------------------- */
  window.addEventListener('resize', function () {
    if (hasGSAP && window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
