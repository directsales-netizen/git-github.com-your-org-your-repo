'use client';

import { useEffect, useRef } from 'react';

/**
 * Light particles for the hero — a purely additive layer that sits between the
 * shader background and the content. It never touches the shader, scrim, glow
 * or orbs. Particles drift slowly, are drawn toward the cursor, and live on two
 * depth layers (far = small/slow, near = larger/faster) so the cursor and
 * page scroll move them at different rates — a parallax effect.
 *
 * Decorative only: aria-hidden, pointer-events-none, and the parent doesn't
 * mount it at all when the user prefers reduced motion.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  depth: number; // 0.3 (far) .. 1 (near)
  alpha: number;
  phase: number;
}

const ACCENT = '47, 231, 242'; // matches the hero's aqua glow rgba(47,231,242)
const MAX_PARTICLES = 90;
const AREA_PER_PARTICLE = 16000; // px² per particle, keeps density even
const PULL_RADIUS = 220;
const PULL_STRENGTH = 0.045;

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };
    let scrollOffset = 0;

    const seed = (): Particle => {
      const depth = 0.3 + Math.random() * 0.7;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18 * depth,
        vy: (Math.random() - 0.5) * 0.18 * depth,
        r: 0.7 + depth * 1.6,
        depth,
        alpha: 0.25 + depth * 0.55,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
      if (particles.length > target) particles.length = target;
      while (particles.length < target) particles.push(seed());
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onScroll = () => {
      scrollOffset = window.scrollY;
    };

    const frame = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Gentle independent drift + slow sinusoidal wobble.
        p.x += p.vx + Math.sin(t / 2400 + p.phase) * 0.05 * p.depth;
        p.y += p.vy + Math.cos(t / 2800 + p.phase) * 0.05 * p.depth;

        // Follow the cursor: near particles are pulled harder than far ones.
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < PULL_RADIUS && dist > 1) {
            const pull = (1 - dist / PULL_RADIUS) * PULL_STRENGTH * p.depth;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        // Damping keeps motion calm; clamp so nothing ever whips around.
        p.vx *= 0.985;
        p.vy *= 0.985;
        const max = 1.4 * p.depth;
        p.vx = Math.max(-max, Math.min(max, p.vx));
        p.vy = Math.max(-max, Math.min(max, p.vy));

        // Wrap at the edges.
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Scroll parallax: near particles shift more than far ones.
        const drawY = p.y - scrollOffset * 0.08 * p.depth;
        const twinkle = 0.75 + 0.25 * Math.sin(t / 900 + p.phase);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${ACCENT}, ${(p.alpha * twinkle).toFixed(3)})`;
        ctx.shadowColor = `rgba(${ACCENT}, 0.8)`;
        ctx.shadowBlur = 6 + p.depth * 8;
        ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    start();

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    // Pause when the hero is off-screen or the tab is hidden — no wasted frames.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}
