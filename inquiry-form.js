/* ismile inquiry-form.js
   Submits the "Start a project" form and the onboarding questionnaire to /api/inquiry.
   Any <form data-inquiry="project|onboarding"> on the page is handled.
*/
(function () {
  function readSource() {
    try { return JSON.parse(sessionStorage.getItem('ismileFirstTouch') || '{}'); } catch (e) { return {}; }
  }

  document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
    var button = form.querySelector('button[type="submit"]');
    var label = button.innerHTML;
    var status = form.querySelector('[data-inquiry-status]');
    var done = document.querySelector('[data-inquiry-done="' + form.id + '"]');

    // Pre-select "How did you hear about us" when the visit arrived with a campaign tag.
    var touch = readSource();
    var heard = form.querySelector('[name="heard"]');
    if (heard && touch.source) {
      Array.prototype.forEach.call(heard.options, function (option) {
        if (option.value && option.value.toLowerCase() === String(touch.source).toLowerCase()) heard.value = option.value;
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var payload = { type: form.getAttribute('data-inquiry') };
      new FormData(form).forEach(function (value, key) { payload[key] = value; });
      payload.track_source = touch.source || '';
      payload.track_referrer = touch.referrer || '';
      payload.track_landing = touch.landing || '';

      button.disabled = true;
      button.textContent = 'SENDING...';
      status.style.display = 'none';

      fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok) throw new Error(body.message || 'We could not send your details. Please email hello@byismile.com.');
          return body;
        });
      }).then(function (body) {
        form.style.display = 'none';
        if (done) {
          var booking = done.querySelector('[data-inquiry-booking]');
          if (booking && body.qualified && /^https:\/\//.test(body.bookingUrl || '')) {
            booking.querySelector('a').href = body.bookingUrl;
            booking.style.display = 'block';
          }
          done.style.display = 'block';
          done.setAttribute('tabindex', '-1');
          done.focus();
          done.scrollIntoView({ block: 'center' });
        }
        if (window.gtag) window.gtag('event', 'generate_lead', { form: payload.type });
      }).catch(function (error) {
        button.disabled = false;
        button.innerHTML = label;
        status.textContent = error.message;
        status.style.display = 'block';
      });
    });
  });
})();
