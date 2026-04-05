/**
 * photo-loader.js
 * ─────────────────────────────────────────────────────────────
 * Enhances the existing photo grid with:
 *   • Dynamic loading from photos.json
 *   • Cloudinary responsive transforms (tiny → thumb → full)
 *   • Blur-up placeholder technique
 *   • Lazy loading via IntersectionObserver
 *   • Optional lightbox for full-res viewing
 *
 * NON-DESTRUCTIVE — does not modify existing CSS or script.js
 * Just add <script src="photo-loader.js" defer></script> to index.html
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── CONFIG ──────────────────────────────────────────────────
  const CLOUDINARY_BASE = 'https://res.cloudinary.com/dzgw5flig/image/upload';
  const JSON_PATH = 'photos.json';

  // Cloudinary transform presets
  const TRANSFORMS = {
    // Tiny placeholder — 30px wide, heavy blur, low quality
    placeholder: 'w_30,e_blur:800,q_10,f_auto',
    // Grid thumbnail — 600px wide, auto quality + format
    thumb: 'w_600,q_auto,f_auto',
    // Large view — 1400px wide, high quality
    large: 'w_1400,q_auto:best,f_auto',
    // Hero film strip — 800px wide
    filmstrip: 'w_800,q_auto,f_auto',
  };

  // ─── HELPERS ─────────────────────────────────────────────────

  /** Build a full Cloudinary URL from an image ID and transform preset */
  function cloudUrl(id, preset) {
    return `${CLOUDINARY_BASE}/${TRANSFORMS[preset]}/v1774457410/${id}.jpg`;
  }

  /** Fetch the photo database */
  async function loadPhotos() {
    try {
      const res = await fetch(JSON_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[photo-loader] Could not load photos.json:', err);
      return null;
    }
  }

  // ─── INJECT STYLES ──────────────────────────────────────────
  // Minimal styles for the blur-up effect and lightbox
  // Scoped with .pl- prefix to avoid conflicts with existing CSS

  const style = document.createElement('style');
  style.textContent = `
    /* Blur-up placeholder wrapper */
    .pl-img-wrap {
      position: relative;
      overflow: hidden;
      background: #1a1a1a;
    }

    .pl-img-wrap .pl-placeholder {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(20px);
      transform: scale(1.1);
      transition: opacity 0.5s ease;
      z-index: 1;
    }

    .pl-img-wrap .pl-placeholder.pl-loaded {
      opacity: 0;
      pointer-events: none;
    }

    .pl-img-wrap .pl-full {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    .pl-img-wrap .pl-full.pl-loaded {
      opacity: 1;
    }

    /* Lightbox overlay */
    .pl-lightbox {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      cursor: zoom-out;
      backdrop-filter: blur(4px);
    }

    .pl-lightbox.pl-visible {
      opacity: 1;
      visibility: visible;
    }

    .pl-lightbox img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 2px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      transform: scale(0.95);
      transition: transform 0.3s ease;
    }

    .pl-lightbox.pl-visible img {
      transform: scale(1);
    }

    .pl-lightbox-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 40px;
      height: 40px;
      background: none;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.2s;
    }

    .pl-lightbox-close:hover {
      border-color: rgba(255,255,255,0.7);
    }

    /* Make grid items clickable */
    .pl-clickable {
      cursor: zoom-in;
    }
  `;
  document.head.appendChild(style);

  // ─── LIGHTBOX ───────────────────────────────────────────────

  let lightboxEl = null;
  let lightboxImg = null;

  function createLightbox() {
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'pl-lightbox';
    lightboxEl.innerHTML = `
      <button class="pl-lightbox-close" aria-label="Close">✕</button>
      <img src="" alt="" />
    `;
    lightboxImg = lightboxEl.querySelector('img');

    // Close on click anywhere
    lightboxEl.addEventListener('click', closeLightbox);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    document.body.appendChild(lightboxEl);
  }

  function openLightbox(photoId) {
    if (!lightboxEl) createLightbox();
    lightboxImg.src = cloudUrl(photoId, 'large');
    lightboxImg.alt = 'Full resolution photo';
    // Force reflow then show
    void lightboxEl.offsetWidth;
    lightboxEl.classList.add('pl-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('pl-visible');
    document.body.style.overflow = '';
    // Clear src after animation
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 300);
  }

  // ─── BLUR-UP IMAGE REPLACEMENT ──────────────────────────────

  /**
   * Takes an existing <img> inside the grid, wraps it with the
   * blur-up placeholder technique, and lazy-loads the real image.
   */
  function enhanceImage(imgEl, photoId) {
    const parent = imgEl.parentElement;

    // Create wrapper
    const wrap = document.createElement('div');
    wrap.className = 'pl-img-wrap';
    wrap.style.width = '100%';
    wrap.style.height = imgEl.style.height || '100%';

    // Placeholder (tiny blurred image — loads instantly)
    const placeholder = document.createElement('img');
    placeholder.className = 'pl-placeholder';
    placeholder.src = cloudUrl(photoId, 'placeholder');
    placeholder.alt = '';
    placeholder.setAttribute('aria-hidden', 'true');

    // Full thumbnail (loaded lazily)
    const full = document.createElement('img');
    full.className = 'pl-full';
    full.alt = imgEl.alt || 'Photo by Paul Bina';
    full.dataset.src = cloudUrl(photoId, 'thumb');
    full.dataset.photoId = photoId;

    wrap.appendChild(placeholder);
    wrap.appendChild(full);

    // Replace original img
    if (parent) {
      parent.replaceChild(wrap, imgEl);

      // Copy over any sizing from original parent
      if (parent.classList.contains('photo-item') || parent.classList.contains('mosaic-item')) {
        wrap.style.height = '100%';
      }
    }

    // Make clickable for lightbox
    wrap.classList.add('pl-clickable');
    wrap.addEventListener('click', () => openLightbox(photoId));

    return { wrap, placeholder, full };
  }

  // ─── LAZY LOADING OBSERVER ──────────────────────────────────

  function setupLazyLoading() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const fullImg = entry.target.querySelector('.pl-full');
          const placeholder = entry.target.querySelector('.pl-placeholder');

          if (fullImg && fullImg.dataset.src) {
            fullImg.src = fullImg.dataset.src;
            delete fullImg.dataset.src;

            fullImg.addEventListener(
              'load',
              () => {
                fullImg.classList.add('pl-loaded');
                if (placeholder) placeholder.classList.add('pl-loaded');
              },
              { once: true }
            );
          }

          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '200px 0px', // Start loading 200px before visible
        threshold: 0.01,
      }
    );

    // Observe all enhanced image wrappers
    document.querySelectorAll('.pl-img-wrap').forEach((wrap) => {
      observer.observe(wrap);
    });
  }

  // ─── ENHANCE EXISTING IMAGES ────────────────────────────────

  /**
   * Finds all existing Cloudinary images on the page and
   * enhances them with blur-up + lazy loading.
   * Works with the existing grid — no HTML changes needed.
   */
  function enhanceExistingImages(photos) {
    // Build a lookup: partial URL match → photo ID
    const idLookup = {};
    photos.forEach((p) => {
      idLookup[p.id] = p.id;
    });

    // Find all <img> tags with Cloudinary URLs
    const allImages = document.querySelectorAll('img[src*="res.cloudinary.com/dzgw5flig"]');

    allImages.forEach((img) => {
      // Extract the photo ID from the URL
      const matchedPhoto = photos.find((p) => img.src.includes(p.id));
      if (!matchedPhoto) return;

      // Skip images inside the film strip (hero) — those are decorative
      // and already small. Only enhance portfolio/grid images.
      const isInFilmStrip = img.closest('.hero-film-strip') || img.closest('.film-frame');
      if (isInFilmStrip) {
        // Just optimize the film strip URL to use the filmstrip preset
        img.src = cloudUrl(matchedPhoto.id, 'filmstrip');
        return;
      }

      // Enhance grid images with blur-up
      enhanceImage(img, matchedPhoto.id);
    });
  }

  // ─── OPTIMIZE FILM STRIP ───────────────────────────────────

  /**
   * Updates film strip images to use optimized Cloudinary transforms
   */
  function optimizeFilmStrip(photos) {
    const filmFrames = document.querySelectorAll('.film-frame img, .hero-film-strip img');
    filmFrames.forEach((img) => {
      const matchedPhoto = photos.find((p) => img.src.includes(p.id));
      if (matchedPhoto) {
        img.src = cloudUrl(matchedPhoto.id, 'filmstrip');
      }
    });
  }

  // ─── INIT ───────────────────────────────────────────────────

  async function init() {
    const photos = await loadPhotos();

    if (!photos || photos.length === 0) {
      console.log('[photo-loader] No photos found or JSON failed to load. Existing images untouched.');
      return;
    }

    console.log(`[photo-loader] Loaded ${photos.length} photos from database.`);

    // Enhance existing images on the page
    enhanceExistingImages(photos);

    // Set up lazy loading for all enhanced images
    setupLazyLoading();

    console.log('[photo-loader] Enhancement complete.');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
