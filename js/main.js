document.addEventListener('DOMContentLoaded', () => {
  /* ===== МУЗЫКА ===== */
  const musicBtn = document.getElementById('musicBtn');
  const music = document.getElementById('bgMusic');
  let isPlaying = false;

  function playMusic() {
    if (isPlaying) return;
    music.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('is-playing');
      musicBtn.setAttribute('aria-pressed', 'true');
    }).catch(() => {
      // Браузер жүктелу кезінде дыбысты автоматты қосуға рұқсат бермеді —
      // қолданушы бетті бірінші рет түртken/басқанда қайта көреміз.
    });
  }

  function pauseMusic() {
    music.pause();
    isPlaying = false;
    musicBtn.classList.remove('is-playing');
    musicBtn.setAttribute('aria-pressed', 'false');
  }

  playMusic();

  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach((evt) => {
    document.addEventListener(evt, () => {
      if (!isPlaying) playMusic();
    }, { once: true, passive: true });
  });

  /* ===== КЕРІ САНАУЫШ ===== */
  const weddingDate = new Date('2026-10-25T18:00:00+05:00').getTime();
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMins.textContent = '00';
      elSecs.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  musicBtn.addEventListener('click', () => {
    if (!isPlaying) playMusic(); else pauseMusic();
  });

  /* ===== ҚОНАҚТАР АНКЕТАСЫ (RSVP) ===== */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpThanks = document.getElementById('rsvpThanks');

  // Google Форма: "Асқар & Жансая той" (Аты-жөніңіз + Тойға қатысасыз ба?)
  const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScxtngz_7GKIAofLwalD2mwXPWMqvwHbEKAFhzmkk7Yt7JfoQ/formResponse';
  const GOOGLE_FORM_ENTRIES = {
    name: 'entry.58792504',
    attendance: 'entry.1386504533'
  };
  const ATTENDANCE_LABELS = {
    yes: 'Иә, келемін',
    couple: 'Жұбыммен келемін',
    no: 'Өкінішке орай, келе алмаймын'
  };

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(rsvpForm);
      const response = {
        name: formData.get('name'),
        attendance: formData.get('attendance'),
        submittedAt: new Date().toISOString()
      };

      // Сақтық көшірме: жауап осы құрылғыда localStorage-та да қалады.
      const stored = JSON.parse(localStorage.getItem('rsvpResponses') || '[]');
      stored.push(response);
      localStorage.setItem('rsvpResponses', JSON.stringify(stored));

      const params = new URLSearchParams();
      params.append(GOOGLE_FORM_ENTRIES.name, response.name || '');
      params.append(GOOGLE_FORM_ENTRIES.attendance, ATTENDANCE_LABELS[response.attendance] || '');

      // Google Форма CORS жауап қайтармайды, сондықтан no-cors қолданамыз:
      // сұраныс жетеді, бірақ жауапты оқи алмаймыз — сол себепті сәтті деп есептейміз.
      fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }).catch(() => {
        console.warn('Google Форманы жіберу сәтсіз аяқталды, тек localStorage-та сақталды.');
      });

      rsvpForm.hidden = true;
      rsvpThanks.hidden = false;
    });
  }
});
