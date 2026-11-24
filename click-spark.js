/*
 * Click Spark: vanilla JS port of the "ClickSpark" component from React Bits
 * https://reactbits.dev/animations/click-spark  ·  https://github.com/DavidHDev/react-bits
 *
 * MIT + Commons Clause License Condition v1.0
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, and distribute the
 * Software as part of an application, website, or product, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 * Commons Clause: you may not sell, sublicense, or redistribute the components themselves, whether
 * alone, in a bundle, or as a ported version.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Settings from the reactbits.dev link: sparkWidth 3.5, sparkRadius 26, randomness 0, sparkSize 10,
 * duration 600, plus the component defaults (8 sparks, ease-out, line shape).
 * Colour follows the site theme through the CSS variable --spark.
 */
(() => {
  'use strict';
  const S = { size: 10, radius: 26, count: 8, width: 3.5, duration: 600, randomness: 0 };
  const REDUCED_MS = 320;
  const MAX_BURSTS = 32;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let ratio = 1;
  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(innerWidth * ratio);
    canvas.height = Math.ceil(innerHeight * ratio);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.body.appendChild(canvas);

  const bursts = [];
  let raf = 0;
  const colour = () => getComputedStyle(document.documentElement).getPropertyValue('--spark').trim() || '#b87383';

  function drawSpark(b, spark, elapsed) {
    const life = reduced ? REDUCED_MS : S.duration * spark.life;
    const p = elapsed / life;
    if (p >= 1) return false;
    const e = reduced ? 0.55 : ease(clamp(p, 0, 1));
    const distance = S.radius * spark.reach * e;
    const fade = reduced ? 1 - p : 1 - smoothstep(0.55, 1, p);
    if (fade <= 0) return true;
    const length = S.size * spark.scale * (reduced ? 0.5 : Math.pow(1 - clamp(p, 0, 1), 1.6));
    const x1 = b.x + Math.cos(spark.angle) * distance, y1 = b.y + Math.sin(spark.angle) * distance;
    const x2 = b.x + Math.cos(spark.angle) * (distance + Math.max(0.01, length));
    const y2 = b.y + Math.sin(spark.angle) * (distance + Math.max(0.01, length));
    ctx.globalAlpha = fade;
    ctx.strokeStyle = b.colour;
    ctx.lineWidth = S.width * spark.scale;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    return true;
  }

  function frame(now) {
    raf = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    for (const b of [...bursts]) {
      let alive = false;
      for (const s of b.sparks) if (drawSpark(b, s, now - b.start)) alive = true;
      if (!alive) bursts.splice(bursts.indexOf(b), 1);
    }
    ctx.globalAlpha = 1;
    if (bursts.length) raf = requestAnimationFrame(frame);
  }

  function spawn(x, y) {
    const step = (Math.PI * 2) / S.count;
    const sparks = Array.from({ length: S.count }, (_, i) => ({
      angle: -Math.PI / 2 + step * i + (Math.random() - 0.5) * S.randomness * step * 0.9,
      reach: 1 + (Math.random() - 0.5) * 0.7 * S.randomness,
      scale: 1 + (Math.random() - 0.5) * 0.8 * S.randomness,
      life: 1 + (Math.random() - 0.5) * 0.5 * S.randomness
    }));
    bursts.push({ x, y, start: performance.now(), sparks, colour: colour() });
    while (bursts.length > MAX_BURSTS) bursts.shift();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  /* Mouse sparks on press; touch and keyboard spark on click (keyboard: centre of the control). */
  let lastPress = { time: -1e9, x: 0, y: 0 };
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    lastPress = { time: performance.now(), x: e.clientX, y: e.clientY };
    spawn(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('click', e => {
    if (e.detail === 0) {
      const el = e.target instanceof Element ? e.target : document.body;
      const r = el.getBoundingClientRect();
      if (r.width && r.height) spawn(r.left + r.width / 2, r.top + r.height / 2);
      return;
    }
    const recent = performance.now() - lastPress.time < 700 && Math.hypot(e.clientX - lastPress.x, e.clientY - lastPress.y) < 12;
    if (!recent) spawn(e.clientX, e.clientY);
  });
})();
