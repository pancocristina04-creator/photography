// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';

  setTimeout(() => {
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
  }, 60);
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => observer.observe(el));

// Portfolio filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Form submit
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