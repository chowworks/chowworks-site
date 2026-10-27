// Nav border on scroll
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// /build intake form: send through FormSubmit's AJAX endpoint, fall back to a normal POST
const form = document.querySelector('#intake');
if (form) {
  const sent = document.querySelector('#sent');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    if (!window.fetch) return;
    e.preventDefault();
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      const res = await fetch(form.dataset.ajax, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      form.hidden = true;
      sent.classList.add('show');
      sent.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Send it';
      form.submit();
    }
  });
}
