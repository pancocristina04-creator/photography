// ─── Scroll reveal ──────────────────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach((el) => observer.observe(el));

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
