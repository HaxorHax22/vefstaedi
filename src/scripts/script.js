// Advanced animations (GSAP) respecting prefers-reduced-motion
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Utilities (must be defined before first use)
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

// Force page to start at top on refresh (respect deep links)
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch {}
if (!location.hash) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.scrollTo(0, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0), { once: true });
  }
}
window.addEventListener('beforeunload', () => { try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {} });

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

// Intersection Observer for reveal animations
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  qsa('.reveal, .reveal-fade').forEach((el) => observer.observe(el));
} else {
  qsa('.reveal, .reveal-fade').forEach((el) => el.classList.add('in-view'));
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
  const benefitsTitle = qs('#why-heading'); if (benefitsTitle && json.benefits?.title) benefitsTitle.textContent = json.benefits.title;
  const benefitsIntro = qs('section[aria-labelledby="why-heading"] p'); if (benefitsIntro && json.benefits?.intro) benefitsIntro.textContent = json.benefits.intro;
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
  if (resultValuesEls.length && Array.isArray(json.results?.values)) {
    resultValuesEls.forEach((el, idx) => { if (json.results.values[idx]) el.textContent = json.results.values[idx]; });
  }

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
 

// Initial content load
loadContent(lang);

// Hero crossfade rotation for phone and laptop
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phoneImg = qs('.hero-device-wrap img');
  const laptopImg = qs('.laptop-image img');
  if (!phoneImg || !laptopImg) return;

  const phoneSources = [
    '/assets/img/hero/phone/iphone_s-s.png',
    '/assets/img/hero/phone/kb_iphone.png',
  ];
  const laptopSources = [
    '/assets/img/hero/laptop/laptop-s-s.png',
    '/assets/img/hero/laptop/laptop-kb.png',
  ];

  let index = 0;
  const duration = 0.6;
  const delay = 6;

  function swap(img, nextSrc) {
    if (reduceMotion) {
      img.src = nextSrc;
      return;
    }
    gsap.to(img, { opacity: 0, duration, ease: 'power2.out', onComplete: () => {
      img.src = nextSrc;
      gsap.to(img, { opacity: 1, duration, ease: 'power2.out' });
    }});
  }

  // Preload images
  [...phoneSources, ...laptopSources].forEach((src) => { const i = new Image(); i.src = src; });

  setInterval(() => {
    index = (index + 1) % phoneSources.length;
    swap(phoneImg, phoneSources[index]);
    swap(laptopImg, laptopSources[index]);
  }, delay * 1000);
})();


