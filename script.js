// ─── Nav: solid background once the hero scrolls out of view ────────────────
const nav  = document.querySelector('nav');
const hero = document.querySelector('.hero');

function updateNav() {
  // Read the current --nav-h from the CSS (changes per breakpoint)
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 88;

  // Switch to solid once we've scrolled past the hero's bottom edge minus nav height
  const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
  nav.classList.toggle('nav-scrolled', heroBottom <= navH);
}

window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });
updateNav(); // run once on load

// ─── Scroll reveal ───────────────────────────────────────────────────────────
// rootMargin top = negative nav height so elements reveal *before* they slide
// under the nav, not after.
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

// Rebuild observer on resize so rootMargin stays in sync with --nav-h
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

// ─── Portfolio filter (visual state only) ───────────────────────────────────
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

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
