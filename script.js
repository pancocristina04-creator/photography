// ─── Nav: solid background once the hero scrolls out of view ────────────────
const nav  = document.querySelector('nav');
const hero = document.querySelector('.hero');
function updateNav() {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 88;
  const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
  nav.classList.toggle('nav-scrolled', heroBottom <= navH);
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });
updateNav();

// ─── Scroll reveal ───────────────────────────────────────────────────────────
function buildObserver() {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 88;
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: `-${navH}px 0px 0px 0px`,
    }
  );
}
let revealObserver = buildObserver();
const reveals = document.querySelectorAll('.reveal');
reveals.forEach((el) => revealObserver.observe(el));

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    revealObserver.disconnect();
    revealObserver = buildObserver();
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) =>
      revealObserver.observe(el)
    );
  }, 200);
}, { passive: true });

// ─── Hero carousel (auto-advances, dots clickable) ───────────────────────────
(function () {
  const track = document.getElementById('heroCarouselTrack');
  const dotsContainer = document.getElementById('heroCarouselDots');
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll('.hero-carousel-slide');
  const dots   = dotsContainer.querySelectorAll('.hero-dot');
  const total  = slides.length;
  let current  = 0;
  let autoTimer;

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  dots.forEach((d, i) => {
    d.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  startAuto();
})();

// ─── Contact form submit (UI feedback only) ──────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.textContent = 'Message Sent ✓';
  btn.style.background = '#4a7c59';
  btn.style.color = '#fff';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
}
