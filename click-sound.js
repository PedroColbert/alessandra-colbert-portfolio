/*
 * Click sounds: small, soft mallet notes made with the Web Audio API (no audio files).
 * Buttons and links play a note from a pentatonic scale, so repeated clicks sound musical;
 * the photo viewer, theme and language switches get their own short phrases; a click on
 * empty space plays a faint tick that pairs with the click spark.
 * Visitors turn it on or off with the speaker button in the header (saved as "ac-sound").
 * It starts on, except when the system asks for reduced motion.
 */
(() => {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  const btn = document.getElementById('sound-toggle');
  if (!AC) { if (btn) btn.hidden = true; return; }

  const KEY = 'ac-sound';
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  let on = saved ? saved === 'on' : !matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ctx = null, out = null, noise = null;
  function audio() {
    if (!ctx) {
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = 0.55;
      const limit = ctx.createDynamicsCompressor();
      limit.threshold.value = -16; limit.ratio.value = 8;
      out.connect(limit); limit.connect(ctx.destination);
      noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.03), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* One soft mallet note: a sine with a slight pitch settle, plus a fast-fading overtone. */
  function note(freq, delay = 0, gain = 0.16, decay = 0.2) {
    const t = ctx.currentTime + 0.005 + delay;
    const body = ctx.createOscillator(), bodyGain = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(freq * 1.015, t);
    body.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    body.connect(bodyGain); bodyGain.connect(out);
    body.start(t); body.stop(t + decay + 0.03);

    const ring = ctx.createOscillator(), ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.value = freq * 3.98;
    ringGain.gain.setValueAtTime(0.0001, t);
    ringGain.gain.exponentialRampToValueAtTime(gain * 0.28, t + 0.003);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.3);
    ring.connect(ringGain); ringGain.connect(out);
    ring.start(t); ring.stop(t + decay * 0.3 + 0.03);
  }

  /* A faint paper-like tick for clicks that land on nothing interactive. */
  function tick() {
    const t = ctx.currentTime + 0.005;
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise;
    band.type = 'bandpass'; band.frequency.value = 2600; band.Q.value = 1.4;
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);
    src.connect(band); band.connect(g); g.connect(out);
    src.start(t); src.stop(t + 0.03);
  }

  // C major pentatonic, C5 to E6: always consonant, whatever order the clicks come in.
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  let step = 2;
  const nextStep = () => {
    step = Math.min(SCALE.length - 1, Math.max(0, step + [-2, -1, 1, 2][Math.floor(Math.random() * 4)]));
    return SCALE[step];
  };

  const SOUNDS = {
    tap: () => note(nextStep()),
    bg: tick,
    open: () => { note(659.25, 0, 0.13); note(987.77, 0.07, 0.13, 0.28); },
    close: () => { note(783.99, 0, 0.12); note(523.25, 0.07, 0.12, 0.26); },
    next: () => note(880, 0, 0.12, 0.14),
    prev: () => note(659.25, 0, 0.12, 0.14),
    toDark: () => { note(783.99, 0, 0.12); note(587.33, 0.07, 0.12); note(392, 0.14, 0.13, 0.34); },
    toLight: () => { note(523.25, 0, 0.12); note(659.25, 0.07, 0.12); note(1046.5, 0.14, 0.12, 0.34); },
    lang: () => { note(659.25, 0, 0.12); note(880, 0.06, 0.12, 0.24); },
    soundOn: () => { note(523.25, 0, 0.12); note(783.99, 0.06, 0.12); note(1046.5, 0.12, 0.13, 0.36); }
  };

  /* Which sound an element gets. `before` is true on mouse press, when the click handlers
     have not run yet, so the theme it predicts is the one the click is about to switch to. */
  function soundFor(target, before) {
    const el = target.closest('a[href],button,[role="button"],summary,label,select');
    if (!el) return 'bg';
    if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.id === 'sound-toggle') return null;
    if (el.id === 'theme-toggle') {
      const dark = root.dataset.theme === 'dark';
      return (before ? !dark : dark) ? 'toDark' : 'toLight';
    }
    if (el.hasAttribute('data-set-lang')) return el.getAttribute('aria-pressed') === 'true' && before ? 'tap' : 'lang';
    if (el.id === 'lightbox-close') return 'close';
    if (el.id === 'lightbox-next') return 'next';
    if (el.id === 'lightbox-prev') return 'prev';
    if (el.classList.contains('photo-tile')) return 'open';
    return 'tap';
  }

  function play(name) {
    if (!on || !name || !audio()) return;
    try { SOUNDS[name](); } catch (e) {}
  }

  /* Same timing as the click spark: mouse plays on press, touch and keyboard on click
     (so a finger that scrolls the page stays silent). */
  let lastPress = { time: -1e9, x: 0, y: 0 };
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    lastPress = { time: performance.now(), x: e.clientX, y: e.clientY };
    if (e.target instanceof Element) play(soundFor(e.target, true));
  }, { passive: true });
  document.addEventListener('click', e => {
    if (!(e.target instanceof Element)) return;
    const fromMouse = e.detail !== 0 && performance.now() - lastPress.time < 700 &&
      Math.hypot(e.clientX - lastPress.x, e.clientY - lastPress.y) < 12;
    if (!fromMouse) play(soundFor(e.target, false));
  });

  if (btn) {
    const sync = () => btn.setAttribute('aria-pressed', String(on));
    sync();
    btn.addEventListener('click', () => {
      on = !on; sync();
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
      if (on) play('soundOn');
    });
  }
})();
