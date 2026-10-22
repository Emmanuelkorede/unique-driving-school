
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var progress = header ? header.querySelector('.site-header__progress span') : null;
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var navLinks = mobileNav ? mobileNav.querySelectorAll('a[href^="#"]') : [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------- 1. MOBILE NAVIGATION */
  function isOpen() {
    return !!mobileNav && mobileNav.classList.contains('is-open');
  }

  function openNav() {
    if (!mobileNav || !toggle) return;
    mobileNav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
    // Force a style recalculation so the panel is visible before it receives focus.
    void mobileNav.offsetHeight;
    var first = mobileNav.querySelector('a');
    if (first) first.focus();
  }

  function closeNav(restoreFocus) {
    if (!mobileNav || !toggle) return;
    mobileNav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
    if (restoreFocus !== false) toggle.focus();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close as soon as a destination is chosen.
    Array.prototype.forEach.call(navLinks, function (link) {
      link.addEventListener('click', function () {
        closeNav(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        closeNav();
      }
    });

    // Leaving the mobile breakpoint must never leave the menu stuck open.
    var desktop = window.matchMedia('(min-width: 1025px)');
    var onBreakpoint = function (event) {
      if (event.matches && isOpen()) closeNav(false);
    };
    if (typeof desktop.addEventListener === 'function') {
      desktop.addEventListener('change', onBreakpoint);
    } else if (typeof desktop.addListener === 'function') {
      desktop.addListener(onBreakpoint);
    }
  }

  /* -------------------------------- 2. HEADER STATE & SCROLL PROGRESS */
  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 12);
    }
    if (progress) {
      var ratio = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
      progress.style.setProperty('--progress', ratio.toFixed(4));
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------- 3. SCROLL REVEAL */
  var revealItems = document.querySelectorAll('[data-reveal]');

  function showAll() {
    Array.prototype.forEach.call(revealItems, function (item) {
      item.classList.add('is-visible');
    });
  }

  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealItems, function (item, index) {
      item.style.transitionDelay = (index % 3) * 90 + 'ms';
      observer.observe(item);
    });

    // If the visitor switches motion preferences mid-session, reveal everything.
    var onMotionChange = function (event) {
      if (event.matches) showAll();
    };
    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', onMotionChange);
    } else if (typeof reduceMotion.addListener === 'function') {
      reduceMotion.addListener(onMotionChange);
    }
  }

  /* ----------------------------- 4. ANCHOR SCROLLING (header offset) */
  function headerOffset() {
    if (!header) return 0;
    var styles = window.getComputedStyle(document.documentElement);
    var declared = parseInt(styles.getPropertyValue('--header-h'), 10);
    return header.offsetHeight || (isNaN(declared) ? 0 : declared);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;

    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    var target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();

    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset() - 12;

    if (reduceMotion.matches || typeof window.scrollTo !== 'function') {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({ top: top, behavior: 'smooth' });
    }

    if (history.replaceState) {
      history.replaceState(null, '', hash);
    }
  });

  /* --------------------------------------------- 5. CURRENT YEAR */
  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}());
