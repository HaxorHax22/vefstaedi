// Advanced animations (GSAP) respecting prefers-reduced-motion
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Utilities (must be defined before first use)
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

// Cookies consent logic
// Initialize cookie banner after DOM is ready
const initCookies = () => {
  const KEY = 'vefstaedi.cookies';
  let accepted = false;
  try { accepted = localStorage.getItem(KEY) === 'accepted'; } catch {}
  const banner = qs('#cookie-consent');
  const allow = qs('#cookieAllow');
  const decline = qs('#cookieDecline');
  if (!banner || !allow || !decline) return;
  if (!accepted) banner.hidden = false;
  allow.addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.setItem(KEY, 'accepted'); } catch {}
    banner.hidden = true;
  });
  decline.addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.setItem(KEY, 'denied'); } catch {}
    banner.hidden = true;
  });
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initCookies();
} else {
  window.addEventListener('DOMContentLoaded', initCookies, { once: true });
}

// Force page to start at top on refresh (respect deep links)
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch {}
if (!location.hash) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.scrollTo(0, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0), { once: true });
  }
}
// Removed scroll-to-top on beforeunload to avoid jump when triggering mailto links

// Allow opening the cookie banner again from footer link (delegated)
window.addEventListener('click', (e) => {
  const t = e.target;
  if (t && t.closest && t.closest('#manageCookiesLink')) {
    e.preventDefault();
    const banner = qs('#cookie-consent');
    if (banner) banner.hidden = false;
  }
});

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  // Scroll progress bar (lime) — lightweight and not overlaying cards
  const progressEl = qs('#progress');
  if (progressEl) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        progressEl.style.width = `${self.progress * 100}%`;
      },
    });
  }

  // Accent bars grow in
  qsa('.card .accent, .pricing-card .accent').forEach((el) => {
    gsap.from(el, {
      width: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el.parentElement, start: 'top 80%' },
    });
  });

  // Parallax on hero title
  const heroTitle = qs('#hero .display');
  if (heroTitle) {
    gsap.fromTo(heroTitle, { y: 0 }, {
      y: -20,
      scrollTrigger: {
        trigger: '#hero',
        scrub: 0.5,
      }
    });
  }

  // Magnetic buttons
  qsa('.btn-primary, .btn-outline, .btn-invert').forEach((btn) => {
    const strength = 20;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: (relX / rect.width) * strength, y: (relY / rect.height) * strength, duration: 0.2 });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.3 }));
  });

  // Magnetic cards - follow cursor with 3D tilt effect
  qsa('.card, .process, .pricing-card, .result-card, .contact-card').forEach((card) => {
    const strength = 35;
    const rotateStrength = 15;
    const scaleStrength = 0.08;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      
      // Calculate normalized positions (-1 to 1)
      const normX = relX / (rect.width / 2);
      const normY = relY / (rect.height / 2);
      
      // Apply magnetic movement, 3D rotation, and dynamic scale
      gsap.to(card, {
        x: normX * strength,
        y: normY * strength,
        rotateY: normX * rotateStrength,
        rotateX: -normY * rotateStrength,
        scale: 1 + (Math.abs(normX) + Math.abs(normY)) * scaleStrength,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });

  // Section card reveals (services, benefits, results) - more dramatic slide-ins
  // Exclude testimonial cards to avoid conflict with marquee animation
  gsap.utils.toArray('.card, .result-card, .pricing-card, .process').forEach((el, idx) => {
    const fromLeft = idx % 2 === 0;
    gsap.from(el, {
      x: fromLeft ? -60 : 60,
      y: 30,
      opacity: 0,
      scale: 0.94,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Trustbar logos subtle float-in
  gsap.utils.toArray('#verkefni .logo').forEach((el, i) => {
    gsap.from(el, {
      y: 16,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.05,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Parallax on hero devices
  const heroWrap = qs('#hero');
  if (heroWrap) {
    const phone = qs('.hero-device-wrap');
    const laptop = qs('.laptop-image');
    if (phone) {
      gsap.to(phone, { y: 20, scrollTrigger: { trigger: heroWrap, start: 'top top', end: 'bottom top', scrub: 0.3 } });
    }
    if (laptop) {
      gsap.to(laptop, { y: 28, scrollTrigger: { trigger: heroWrap, start: 'top top', end: 'bottom top', scrub: 0.3 } });
    }
  }

  // About image subtle parallax + tilt
  const aboutImg = qs('#um-okkur img');
  if (aboutImg) {
    gsap.fromTo(aboutImg, { y: 20, rotate: -1 }, {
      y: -10,
      rotate: 0.5,
      ease: 'none',
      scrollTrigger: { trigger: '#um-okkur', start: 'top 80%', end: 'bottom 20%', scrub: 0.3 }
    });
  }

// Smooth press + scroll-to-section easing for anchor buttons
qsa('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    // Respect prefers-reduced-motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // let browser default (we set CSS smooth behavior already)

    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 16;
    gsap.to(window, { duration: 0.7, scrollTo: { y }, ease: 'power2.out', onComplete: () => {
      history.pushState(null, '', href);
    }});
    // Subtle press animation
    gsap.fromTo(link, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }, { passive: false });
});
}
// (moved utilities to top)

// Ensure page starts at top on refresh (respect deep links)
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch {}
const scrollToTopOnLoad = () => { if (!location.hash) window.scrollTo(0, 0); };
window.addEventListener('load', scrollToTopOnLoad);
window.addEventListener('pageshow', scrollToTopOnLoad);

// Year in footer
qs('#year').textContent = new Date().getFullYear();

// Enhanced GSAP-based reveal animations
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && typeof gsap !== 'undefined') {
  // Dramatic text animations for headings
  const animateText = (element) => {
    const text = element.textContent;
    const words = text.split(' ');
    element.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
    
    gsap.fromTo(element.querySelectorAll('.word'), 
      { 
        opacity: 0, 
        y: 30, 
        rotationX: -90 
      }, 
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  };

  // Staggered card reveals with dramatic effects
  const animateCards = (container) => {
    const cards = container.querySelectorAll('.card, .process, .pricing-card, .testimonial-card, .benefit-card');
    
    cards.forEach((card, index) => {
      // Different entrance directions for variety
      const directions = [
        { x: -100, rotation: -5 },
        { x: 100, rotation: 5 },
        { y: 100, rotation: 2 },
        { x: -80, y: 50, rotation: -3 },
        { x: 80, y: 50, rotation: 3 }
      ];
      
      const direction = directions[index % directions.length];
      
      gsap.fromTo(card, 
        { 
          opacity: 0,
          scale: 0.8,
          ...direction
        }, 
        { 
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 1.2,
          delay: index * 0.15,
          ease: "elastic.out(1, 0.8)",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  };

  // Apply text animations to main headings
  qsa('h1, h2, h3').forEach(heading => {
    if (heading.closest('.hero') || heading.textContent.length < 50) {
      animateText(heading);
    }
  });

  // Apply staggered card animations to sections
  qsa('.benefits-grid, .process-grid, .pricing-grid, .grid-3').forEach(container => {
    animateCards(container);
  });

  // Special hero subtitle animation
  const heroSubtitle = qs('.hero .subtitle');
  if (heroSubtitle) {
    gsap.fromTo(heroSubtitle, 
      { 
        opacity: 0, 
        y: 50, 
        filter: "blur(10px)" 
      }, 
      { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        duration: 1.5,
        delay: 0.8,
        ease: "power3.out"
      }
    );
  }

  // Fallback intersection observer for elements without GSAP animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  
  qsa('.reveal:not(.card):not(.process):not(.pricing-card), .reveal-fade').forEach((el) => observer.observe(el));
} else {
  // Fallback for reduced motion or no GSAP
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  qsa('.reveal, .reveal-fade').forEach((el) => observer.observe(el));
}

// Mobile menu with focus trap
const hamburger = qs('#hamburger');
const mobileMenu = qs('#mobile-menu');
let lastFocused = null;
let scrollLock = false;
const menuCloseBtn = qs('#menuClose');

function trapFocus(container, event) {
  const focusable = qsa('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])', container)
    .filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    last.focus();
    event.preventDefault();
  } else if (!event.shiftKey && document.activeElement === last) {
    first.focus();
    event.preventDefault();
  }
}

function openMenu() {
  lastFocused = document.activeElement;
  mobileMenu.hidden = false;
  hamburger.setAttribute('aria-expanded', 'true');
  const firstLink = qs('a, button', mobileMenu);
  firstLink && firstLink.focus();
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
  scrollLock = true;
}

function closeMenu() {
  mobileMenu.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
  lastFocused && lastFocused.focus();
  document.removeEventListener('keydown', onKeydown);
  if (scrollLock) {
    document.body.style.overflow = '';
    scrollLock = false;
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') return closeMenu();
  if (e.key === 'Tab') trapFocus(mobileMenu, e);
}

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  expanded ? closeMenu() : openMenu();
});

qsa('#mobile-menu a').forEach((a) => a.addEventListener('click', closeMenu));
menuCloseBtn?.addEventListener('click', closeMenu);

// Click outside to close (overlay click)
mobileMenu?.addEventListener('click', (e) => {
  if (e.target === mobileMenu) closeMenu();
});

// Bilingual content loading
let lang = 'is';
const storageKey = 'vefstaedi.lang';
try { lang = localStorage.getItem(storageKey) || 'is'; } catch {}
document.documentElement.lang = lang;

async function loadContent(nextLang) {
  // In production the app is served from dist; ensure JSON is accessible via public/
  // Try /data (public) first; fall back to /src/data during dev
  let file = nextLang === 'en' ? '/data/content.en.json' : '/data/content.is.json';
  let res;
  try {
    res = await fetch(file, { cache: 'no-cache' });
    if (!res.ok) throw new Error('not ok');
  } catch {
    file = nextLang === 'en' ? '/src/data/content.en.json' : '/src/data/content.is.json';
    res = await fetch(file, { cache: 'no-cache' });
  }
  const json = await res.json();

  // Generic i18n binder: fill any element with data-i18n / data-i18n-placeholder
  // This guarantees new sections (clients, pricing, FAQ headings, footer, etc.) translate without bespoke JS.
  const getByPath = (obj, path) => {
    try {
      return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
    } catch {
      return undefined;
    }
  };
  try {
    qsa('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = getByPath(json, key);
      if (val !== undefined && val !== null && typeof val !== 'object') {
        el.textContent = String(val);
      }
    });
    qsa('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const val = getByPath(json, key);
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });
  } catch {}

  // Hero
  const hero = json.hero;
  const heroTitle = qs('[data-i18n="hero.title"]');
  const heroSubtitle = qs('[data-i18n="hero.subtitle"]');
  const heroPrimary = qsa('[data-i18n="hero.primaryAction"]');
  const heroSecondary = qsa('[data-i18n="hero.secondaryAction"]');
  if (heroTitle) heroTitle.textContent = hero.title;
  if (heroSubtitle) heroSubtitle.textContent = hero.subtitle;
  heroPrimary.forEach((e) => (e.textContent = hero.primaryAction));
  heroSecondary.forEach((e) => (e.textContent = hero.secondaryAction));

  // Nav
  const nav = json.nav;
  qsa('[data-i18n="nav.services"]').forEach((e) => (e.textContent = nav.services));
  qsa('[data-i18n="nav.pricing"]').forEach((e) => (e.textContent = nav.pricing));
  qsa('[data-i18n="nav.work"]').forEach((e) => (e.textContent = nav.work));
  qsa('[data-i18n="nav.contact"]').forEach((e) => (e.textContent = nav.contact));
  qsa('[data-i18n="nav.faq"]').forEach((e) => (e.textContent = nav.faq));
  const skip = qs('.skip-link'); if (skip && json.skipLink) skip.textContent = json.skipLink;

  // CTA banner
  qsa('[data-i18n="cta.button"]').forEach((e) => (e.textContent = json.cta.button));
  qsa('.cta-title').forEach((e) => { if (json.cta?.title) e.textContent = json.cta.title; });

  // Cookie banner text
  try {
    const cookieText = qs('#cookieText');
    const allowBtn = qs('#cookieAllow');
    const denyBtn = qs('#cookieDecline');
    if (cookieText && json.cookies?.message) cookieText.textContent = json.cookies.message;
    if (allowBtn && json.cookies?.allow) allowBtn.textContent = json.cookies.allow;
    if (denyBtn && json.cookies?.deny) denyBtn.textContent = json.cookies.deny;
  } catch {}

  // Contact
  qsa('[data-i18n="contact.title"]').forEach((e) => (e.textContent = json.contact.title));
  qsa('[data-i18n="contact.submit"]').forEach((e) => (e.textContent = json.contact.submit));
  // Contact form field labels based on input name
  const contactForm = qs('form[name="contact"]');
  if (contactForm && json.contactLabels) {
    qsa('label.field', contactForm).forEach((label) => {
      const span = label.querySelector('span');
      const control = label.querySelector('input, textarea, select');
      const key = control?.getAttribute('name');
      if (span && key && json.contactLabels[key]) {
        span.textContent = json.contactLabels[key];
      }
    });
  }

  // About
  qsa('[data-i18n="about.kicker"]').forEach((e) => (e.textContent = json.about.kicker));
  qsa('[data-i18n="about.title"]').forEach((e) => (e.textContent = json.about.title));
  qsa('[data-i18n="about.p1"]').forEach((e) => (e.textContent = json.about.p1));
  qsa('[data-i18n="about.p2"]').forEach((e) => (e.textContent = json.about.p2));
  qsa('[data-i18n="about.p3"]').forEach((e) => (e.textContent = json.about.p3));
  qsa('[data-i18n="about.stat1"]').forEach((e) => (e.textContent = json.about.stat1));
  qsa('[data-i18n="about.stat2"]').forEach((e) => (e.textContent = json.about.stat2));
  qsa('[data-i18n="about.stat3"]').forEach((e) => (e.textContent = json.about.stat3));

  // Services
  const svc = json.services;
  if (svc) {
    const svcCards = qsa('#thjonusta .card');
    if (svcCards[0]) { const h = svcCards[0].querySelector('h3'); const p = svcCards[0].querySelector('p'); if (h && svc.card1?.title) h.textContent = svc.card1.title; if (p && svc.card1?.desc) p.textContent = svc.card1.desc; }
    if (svcCards[1]) { const h = svcCards[1].querySelector('h3'); const p = svcCards[1].querySelector('p'); if (h && svc.card2?.title) h.textContent = svc.card2.title; if (p && svc.card2?.desc) p.textContent = svc.card2.desc; }
    if (svcCards[2]) { const h = svcCards[2].querySelector('h3'); const p = svcCards[2].querySelector('p'); if (h && svc.card3?.title) h.textContent = svc.card3.title; if (p && svc.card3?.desc) p.textContent = svc.card3.desc; }

    // Translate chips if provided
    const chipGroups = [svc.card1?.chips, svc.card2?.chips, svc.card3?.chips];
    svcCards.forEach((card, idx) => {
      const chips = chipGroups[idx];
      if (!chips || !Array.isArray(chips)) return;
      const chipsRoot = card.querySelector('.chips');
      if (!chipsRoot) return;
      // Replace existing chips with translated ones
      chipsRoot.innerHTML = chips.map((label) => `<span class="chip">${label}</span>`).join('');
    });
  }

  // Process
  const proc = json.process;
  if (proc) {
    const steps = qsa('.process');
    if (steps[0]) { const h = steps[0].querySelector('h4'); const p = steps[0].querySelector('p'); if (h && proc.step1?.title) h.textContent = proc.step1.title; if (p && proc.step1?.desc) p.textContent = proc.step1.desc; }
    if (steps[1]) { const h = steps[1].querySelector('h4'); const p = steps[1].querySelector('p'); if (h && proc.step2?.title) h.textContent = proc.step2.title; if (p && proc.step2?.desc) p.textContent = proc.step2.desc; }
    if (steps[2]) { const h = steps[2].querySelector('h4'); const p = steps[2].querySelector('p'); if (h && proc.step3?.title) h.textContent = proc.step3.title; if (p && proc.step3?.desc) p.textContent = proc.step3.desc; }
  }

  // Benefits title + intro
  try {
    const benefitsTitle = qs('#why-heading'); if (benefitsTitle && json.benefits?.title) benefitsTitle.textContent = json.benefits.title;
    const benefitsIntro = qs('section[aria-labelledby="why-heading"] p'); if (benefitsIntro && json.benefits?.intro) benefitsIntro.textContent = json.benefits.intro;
  } catch {}
  const benefitsCards = qsa('section[aria-labelledby="why-heading"] .card');
  if (benefitsCards[0] && json.benefits?.card1) {
    const h = benefitsCards[0].querySelector('h4'); const p = benefitsCards[0].querySelector('p');
    if (h && json.benefits.card1.title) h.textContent = json.benefits.card1.title;
    if (p && json.benefits.card1.desc) p.textContent = json.benefits.card1.desc;
  }
  if (benefitsCards[1] && json.benefits?.card2) {
    const h = benefitsCards[1].querySelector('h4'); const p = benefitsCards[1].querySelector('p');
    if (h && json.benefits.card2.title) h.textContent = json.benefits.card2.title;
    if (p && json.benefits.card2.desc) p.textContent = json.benefits.card2.desc;
  }
  if (benefitsCards[2] && json.benefits?.card3) {
    const h = benefitsCards[2].querySelector('h4'); const p = benefitsCards[2].querySelector('p');
    if (h && json.benefits.card3.title) h.textContent = json.benefits.card3.title;
    if (p && json.benefits.card3.desc) p.textContent = json.benefits.card3.desc;
  }

  // Results title
  const resultsTitle = qs('#results-heading'); if (resultsTitle && json.results?.title) resultsTitle.textContent = json.results.title;
  const resultCards = qsa('#nidurstodur .result-card .result-caption');
  if (resultCards.length && Array.isArray(json.results?.cards)) {
    resultCards.forEach((el, idx) => { if (json.results.cards[idx]?.caption) el.textContent = json.results.cards[idx].caption; });
  }
  // Results numeric values (if provided)
  const resultValuesEls = qsa('#nidurstodur .result-card .result-value');
  try {
    if (resultValuesEls.length && Array.isArray(json.results?.values)) {
      resultValuesEls.forEach((el, idx) => {
        const val = json.results.values[idx];
        if (!val) return;
        // If value contains a space (e.g., "48–72 hours"), split last token as unit
        const parts = String(val).split(' ');
        if (parts.length > 1) {
          const unit = parts.pop();
          el.textContent = parts.join(' ');
          // add a unit line for better wrapping
          const unitEl = document.createElement('span');
          unitEl.className = 'unit';
          unitEl.textContent = unit;
          el.appendChild(unitEl);
        } else {
          el.textContent = val;
        }
      });
    }
  } catch {}

  // Animate result counters when they enter
  const resultCardsWrap = qs('#nidurstodur');
  try {
    if (resultCardsWrap && resultValuesEls.length) {
      resultValuesEls.forEach((el) => {
        const fullText = el.childNodes[0]?.textContent || el.textContent || '';
        // Extract numeric part (handle ranges like 48–72)
        const rangeMatch = fullText.match(/^(\d+)[^\d]+(\d+)/);
        const numMatch = fullText.match(/(\d+(?:\.\d+)?)/);
        if (rangeMatch) {
          const start = Number(rangeMatch[1]);
          const end = Number(rangeMatch[2]);
          gsap.fromTo({ v: start }, { v: end, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: function() {
            const val = Math.round(this.targets()[0].v);
            if (el.childNodes[0]) el.childNodes[0].textContent = `${val}–${end}`;
          }});
        } else if (numMatch) {
          const end = Number(numMatch[1]);
          gsap.fromTo({ v: 0 }, { v: end, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: function() {
            const val = Math.round(this.targets()[0].v);
            el.childNodes[0] ? el.childNodes[0].textContent = String(val) : el.textContent = String(val);
          }});
        }
      });
    }
  } catch {}

  // Pricing
  if (json.pricing?.note) qsa('.pricing-note').forEach((e) => e.textContent = json.pricing.note);
  const pricingCards = qsa('#verd .pricing-card');
  if (pricingCards[0]) { const h = pricingCards[0].querySelector('h3'); if (h && json.pricing.card1?.title) h.textContent = json.pricing.card1.title; }
  if (pricingCards[1]) { const h = pricingCards[1].querySelector('h3'); if (h && json.pricing.card2?.title) h.textContent = json.pricing.card2.title; const badge = pricingCards[1].querySelector('.badge'); if (badge && json.pricing.card2?.badge) badge.textContent = json.pricing.card2.badge; }
  if (pricingCards[2]) { const h = pricingCards[2].querySelector('h3'); if (h && json.pricing.card3?.title) h.textContent = json.pricing.card3.title; }
  qsa('#verd .pricing-card').forEach((card, idx) => {
    const ul = card.querySelector('.features');
    const list = idx === 0 ? json.pricing.card1?.features : idx === 1 ? json.pricing.card2?.features : json.pricing.card3?.features;
    if (ul && Array.isArray(list)) {
      ul.innerHTML = '';
      list.forEach((li) => { const el = document.createElement('li'); el.textContent = li; ul.appendChild(el); });
    }
  });
  const maint = json.maintenance;
  if (maint) {
    const h = qs('.maintenance h4'); if (h && maint.title) h.textContent = maint.title;
    const price = qs('.maintenance .price-small'); if (price && maint.price) price.textContent = maint.price;
    const tagsRoot = qs('.maintenance .tags'); if (tagsRoot && Array.isArray(maint.tags)) { tagsRoot.innerHTML = ''; maint.tags.forEach(t => { const li = document.createElement('li'); li.textContent = t; tagsRoot.appendChild(li); }); }
  }

  // FAQ render
  const faqRoot = qs('#faq-list');
  if (faqRoot && Array.isArray(json.faq)) {
    faqRoot.innerHTML = '';
    json.faq.forEach((item, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'accordion-item';

      const btn = document.createElement('button');
      btn.className = 'accordion-button';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', `faq-a-${idx}`);
      btn.id = `faq-q-${idx}`;

      const q = document.createElement('span');
      q.className = 'accordion-q';
      q.textContent = item.q;

      const icon = document.createElement('span');
      icon.className = 'accordion-icon';
      icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#141414" stroke-width="2" stroke-linecap="round"/></svg>';

      btn.append(q, icon);

      const a = document.createElement('div');
      a.className = 'accordion-a hidden';
      a.id = `faq-a-${idx}`;
      a.setAttribute('role', 'region');
      a.setAttribute('aria-labelledby', btn.id);
      a.textContent = item.a;

      // Prepare animated region
      a.style.height = '0px';
      a.style.overflow = 'hidden';
      a.classList.add('hidden');

      btn.addEventListener('click', () => {
        const wasExpanded = btn.getAttribute('aria-expanded') === 'true';
        const nowExpanded = !wasExpanded;
        btn.setAttribute('aria-expanded', String(nowExpanded));

        // Update icon
        icon.innerHTML = nowExpanded
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="#141414" stroke-width="2" stroke-linecap="round"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#141414" stroke-width="2" stroke-linecap="round"/></svg>';

        if (reduce) {
          a.classList.toggle('hidden', !nowExpanded);
          a.style.height = nowExpanded ? 'auto' : '0px';
          return;
        }

        if (nowExpanded) {
          a.classList.remove('hidden');
          // measure target height
          a.style.height = 'auto';
          const targetHeight = `${a.scrollHeight}px`;
          a.style.height = '0px';
          gsap.to(a, { height: targetHeight, opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: () => {
            a.style.height = 'auto';
          }});
          gsap.fromTo(btn, { scale: 0.98 }, { scale: 1, duration: 0.18, ease: 'power2.out' });
        } else {
          const currentHeight = `${a.scrollHeight}px`;
          a.style.height = currentHeight; // ensure gsap sees current height
          gsap.to(a, { height: 0, opacity: 0.9, duration: 0.28, ease: 'power2.in', onComplete: () => {
            a.classList.add('hidden');
            a.style.height = '0px';
          }});
        }
      });

      wrapper.append(btn, a);
      faqRoot.appendChild(wrapper);
    });
  }

  // Testimonials (Vitnisburðir)
  try {
    const testiTitle = qs('#testimonials-heading');
    if (testiTitle && json.testimonials?.title) testiTitle.textContent = json.testimonials.title;
    const items = json.testimonials?.items || [];
    const cards = qsa('#tilmaeli .testimonial-card');
    cards.forEach((card, idx) => {
      const item = items[idx % items.length];
      if (!item) return;
      const author = card.querySelector('.testimonial-author');
      const quote = card.querySelector('.testimonial-quote');
      if (author && item.author) author.textContent = item.author;
      if (quote && item.quote) quote.textContent = `“${item.quote}”`;
    });
  } catch {}

  // Safety: ensure reveal sections are visible even if an observer/animation fails
  try {
    qsa('section[aria-labelledby="why-heading"] .card, #nidurstodur .result-card, #tilmaeli .testimonial-card').forEach((el) => {
      el.classList.add('in-view');
    });
  } catch {}

  document.documentElement.lang = nextLang;
}

function toggleLangHandler() {
  lang = lang === 'is' ? 'en' : 'is';
  try { localStorage.setItem(storageKey, lang); } catch {}
  loadContent(lang);
}

qs('#langToggle')?.addEventListener('click', () => {
  toggleLangHandler();
});
qs('#langToggleMobile')?.addEventListener('click', () => {
  toggleLangHandler();
});

// Pricing plan prefill functionality
function initPricingPrefill() {
  // Extract plan from URL hash/query
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const plan = urlParams.get('plan') || hashParams.get('plan');
  
  if (plan) {
    const planField = qs('#selectedPlan');
    if (planField) {
      planField.value = plan;
    }
  }

  // Add click handlers to pricing buttons
  qsa('.pricing-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Prefer data-plan attribute for email template
      const planType = btn.getAttribute('data-plan') || '';
      
      // Analytics tracking
      try {
        if (window.plausible && planType) {
          window.plausible('pricing_cta', { props: { plan: planType } });
        }
      } catch {}
      
      // Build mailto
      const to = ['hannes@hanneshelgi.com','stebbidabba@gmail.com'].join(',');
      const isEn = (typeof lang === 'string' ? lang : document.documentElement.lang) === 'en';
      const planNames = isEn
        ? { monthly: 'Monthly Subscription', annual: 'Annual Subscription', pro: 'Pro Subscription' }
        : { monthly: 'Mánaðaráskrift', annual: 'Ársáskrift', pro: 'Pro Áskrift' };
      const subject = encodeURIComponent(
        isEn ? `Inquiry – ${planNames[planType] || 'Plan'}` : `Fyrirspurn – ${planNames[planType] || 'Áætlun'}`
      );
      const body = encodeURIComponent(
        isEn
          ? `Hello\n\nI would like to choose: ${planNames[planType] || planType}\n\nDetails:\n- Name: \n- Company: \n- Phone: \n\nShort description of needs: \n\nBest regards,\n`
          : `Sælir\n\nMig langar að velja: ${planNames[planType] || planType}\n\nUpplýsingar:\n- Nafn: \n- Fyrirtæki: \n- Sími: \n\nStutt lýsing á þörfum: \n\nKveðja,\n`
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  });
}

// Initialize on load
initPricingPrefill();
 
// Projects: highlight selected client card via hash/query (?client=slug)
function initProjectFocus() {
  try {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const client = hashParams.get('client');
    if (!client) return;
    const target = document.querySelector(`[data-client="${client}"]`);
    if (!target) return;
    // Scroll into view and highlight briefly
    target.classList.add('highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => target.classList.remove('highlight'), 2200);
  } catch {}
}

initProjectFocus();

// Hero image rotation
function initHeroImageRotation() {
  const heroPhone = qs('#hero-phone');
  const heroLaptop = qs('#hero-laptop');
  
  if (!heroPhone || !heroLaptop) return;
  
  // Cache-bust hero images on localhost to avoid stale assets during development
  const isDevHost = /localhost|127\.0\.0\.1/.test(location.hostname);
  const bust = isDevHost ? `?v=${Date.now()}` : '';

  const imageSets = [
    {
      phone: `/assets/img/hero/phone/iphone_s-s.png${bust}`,
      laptop: `/assets/img/hero/laptop/laptop-s-s.png${bust}`,
      alt: 'SÞS verkefni'
    },
    {
      phone: `/assets/img/hero/phone/new_KB_phone.png${bust}`,
      laptop: `/assets/img/hero/laptop/laptop-kb.png${bust}`,
      alt: 'Kjölur Byggingafélag verkefni'
    },
    {
      phone: `/assets/img/hero/phone/TD_phone.app.png${bust}`,
      laptop: `/assets/img/hero/laptop/TD_mac.png${bust}`,
      alt: 'Tómas Darri verkefni'
    }
  ];
  
  let currentIndex = 0;
  const applySet = (idx) => {
    const s = imageSets[idx];
    heroPhone.src = s.phone;
    heroLaptop.src = s.laptop;
    heroPhone.alt = `${s.alt} í símaskjá`;
    heroLaptop.alt = `${s.alt} í fartölvu`;
  };

  const next = () => {
    // Fade out, switch, fade in
    heroPhone.style.opacity = '0.3';
    heroLaptop.style.opacity = '0.3';
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % imageSets.length;
      applySet(currentIndex);
      // Use requestAnimationFrame to ensure both images update in the same frame
      requestAnimationFrame(() => {
        heroPhone.style.opacity = '1';
        heroLaptop.style.opacity = '1';
      });
    }, 250);
  };
  
  // Ensure initial set uses cache-busted URLs too
  applySet(0);

  // Add smooth transitions
  heroPhone.style.transition = 'opacity 300ms ease';
  heroLaptop.style.transition = 'opacity 300ms ease';
  
  // Apply the first different set shortly after load so we don't repeat the initial set
  setTimeout(next, 1200);
  // Continue rotation
  setInterval(next, 4500);
}

// Initialize hero rotation
initHeroImageRotation();

  // Testimonials (Vitnisburðir)
  try {
    const testiTitle = qs('#testimonials-heading');
    if (testiTitle && json.testimonials?.title) testiTitle.textContent = json.testimonials.title;
    const items = json.testimonials?.items || [];
    const cards = qsa('#tilmaeli .testimonial-card');
    cards.forEach((card, idx) => {
      const item = items[idx % items.length];
      if (!item) return;
      const author = card.querySelector('.testimonial-author');
      const quote = card.querySelector('.testimonial-quote');
      if (author && item.author) author.textContent = item.author;
      if (quote && item.quote) quote.textContent = `“${item.quote}”`;
    });
  } catch {}

// Initial content load
loadContent(lang);

// (Removed legacy hero crossfade rotation that used old images)


