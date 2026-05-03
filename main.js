/* =====================================================
   Treebeerd's Taphouse - main.js
   ES module; no build step required
   ===================================================== */

// --- Loader ---
const loader = document.getElementById('loader');

function dismissLoader() {
  loader.classList.add('is-done');
  setTimeout(() => {
    loader.style.display = 'none';
    document.body.classList.add('is-visible');
  }, 420);
}

window.addEventListener('load', () => {
  // Minimum 1.2s loader per spec
  const elapsed = performance.now();
  const remaining = Math.max(0, 1200 - elapsed);
  setTimeout(dismissLoader, remaining);
});

// Fallback: if load event fires late, use DOMContentLoaded as floor
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!loader.classList.contains('is-done')) dismissLoader();
  }, 1400);
});

// --- Nav scroll opacity ---
const nav = document.getElementById('nav');

const navObserver = new IntersectionObserver(
  ([entry]) => {
    nav.classList.toggle('is-scrolled', !entry.isIntersecting);
  },
  { rootMargin: '-60px 0px 0px 0px' }
);

const sentinel = document.querySelector('.hero__bg');
if (sentinel) navObserver.observe(sentinel);

// --- Mobile nav ---
const burger = document.getElementById('navBurger');
const overlay = document.getElementById('navOverlay');
const closeBtn = document.getElementById('navClose');
const overlayLinks = document.querySelectorAll('.nav__overlay-link');

function openMenu() {
  overlay.classList.add('is-open');
  overlay.removeAttribute('aria-hidden');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function closeMenu() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  burger.focus();
}

burger.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);

overlayLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
});

// --- Stats count-up ---
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el, target, duration) {
  if (prefersReduced) { el.textContent = target; return; }
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat__num[data-count]');

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCount(el, target, 1200);
        statsObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

statNums.forEach(el => statsObserver.observe(el));

// --- Scroll reveal (rise) ---
const riseEls = document.querySelectorAll('.rise');

const riseObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger cards within their parent
        const siblings = Array.from(el.parentElement.querySelectorAll('.rise'));
        const idx = siblings.indexOf(el);
        const delay = idx * 80;
        setTimeout(() => el.classList.add('is-visible'), delay);
        riseObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.15 }
);

riseEls.forEach(el => riseObserver.observe(el));

// --- Gallery lightbox ---
const galleryItems = document.querySelectorAll('.gallery__item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxOverlay = document.getElementById('lightboxOverlay');

let currentIndex = 0;

// Collect gallery images for lightbox
const galleryData = Array.from(galleryItems).map(item => {
  const img = item.querySelector('img');
  return { src: img.src, alt: img.alt };
});

function openLightbox(index) {
  currentIndex = index;
  const data = galleryData[index];
  lightboxImg.src = data.src;
  lightboxImg.alt = data.alt;
  lightbox.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.setAttribute('hidden', '');
  document.body.style.overflow = '';
  if (galleryItems[currentIndex]) galleryItems[currentIndex].focus();
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
  lightboxImg.src = galleryData[currentIndex].src;
  lightboxImg.alt = galleryData[currentIndex].alt;
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryData.length;
  lightboxImg.src = galleryData[currentIndex].src;
  lightboxImg.alt = galleryData[currentIndex].alt;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);

document.addEventListener('keydown', e => {
  if (lightbox.hasAttribute('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});
