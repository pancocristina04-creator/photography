// ─── Language Switching ──────────────────────────────────────────────────────
(function () {
  function getInitialLang() {
    var urlParams = new URLSearchParams(window.location.search);
    var urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'ro') return urlLang;
    var stored = localStorage.getItem('paulbina-lang');
    if (stored === 'en' || stored === 'ro') return stored;
    return 'ro';
  }

  var currentLang = getInitialLang();

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('paulbina-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-ro][data-en]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text) el.textContent = text;
    });

    var langFlag = document.getElementById('langFlag');
    if (langFlag) langFlag.textContent = lang === 'ro' ? 'EN' : 'RO';

    if (lang === 'ro') {
      document.title = 'Paul Bina | Fotograf Portret, Peisaj & Editorial';
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', 'Paul Bina, fotograf cu ochi pentru detaliul care face diferența. Portret, peisaj, editorial. 8+ ani de experiență, 200+ proiecte, 15+ țări. Scrie-mi.');
      var ot = document.querySelector('meta[property="og:title"]');
      if (ot) ot.setAttribute('content', 'Paul Bina | Fotograf Portret, Peisaj & Editorial');
      var od = document.querySelector('meta[property="og:description"]');
      if (od) od.setAttribute('content', 'Fotograf cu ochi pentru detaliul care face diferența. Portret, peisaj, editorial. 8+ ani, 200+ proiecte, 15+ țări.');
    } else {
      document.title = 'Paul Bina | Portrait, Landscape & Editorial Photographer';
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', 'Paul Bina, photographer with an eye for the details others miss. Portrait, landscape, editorial. 8+ years, 200+ projects, 15+ countries. Let\'s talk.');
      var ot = document.querySelector('meta[property="og:title"]');
      if (ot) ot.setAttribute('content', 'Paul Bina | Portrait, Landscape & Editorial Photographer');
      var od = document.querySelector('meta[property="og:description"]');
      if (od) od.setAttribute('content', 'Photographer with an eye for the details others miss. Portrait, landscape, editorial. 8+ years, 200+ projects, 15+ countries.');
    }

    var url = new URL(window.location);
    if (lang === 'ro') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', 'en');
    }
    history.replaceState(null, '', url.toString());
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);
    var langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
      langSwitch.addEventListener('click', function () {
        applyLanguage(currentLang === 'ro' ? 'en' : 'ro');
      });
    }
  });
})();

// ─── Nav scroll ──────────────────────────────────────────────────────────────
function updateNav() {
  var nav = document.querySelector('nav');
  var hero = document.querySelector('.hero');
  if (!nav || !hero) return;
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 88;
  nav.classList.toggle('nav-scrolled', hero.getBoundingClientRect().bottom <= navH);
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });
updateNav();

// ─── Scroll reveal ──────────────────────────────────────────────────────────
function buildObserver() {
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 88;
  return new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('visible'); }, i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '-' + navH + 'px 0px 0px 0px' }
  );
}

var revealObserver = buildObserver();
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
});

var resizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    revealObserver.disconnect();
    revealObserver = buildObserver();
    document.querySelectorAll('.reveal:not(.visible)').forEach(function (el) { revealObserver.observe(el); });
  }, 200);
}, { passive: true });

// ─── Portfolio filter ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
});

// ─── Contact form ────────────────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('.form-submit');
  var lang = document.documentElement.lang || 'ro';
  btn.textContent = lang === 'ro' ? 'Trimis ✓' : 'Sent ✓';
  btn.style.background = '#4a7c59';
  btn.style.color = '#fff';
  setTimeout(function () {
    btn.textContent = lang === 'ro' ? 'Trimite' : 'Send';
    btn.style.background = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
}
