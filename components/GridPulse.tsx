'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/components/providers/AppProviders';
import styles from './GridPulse.module.css';

type GridPulseProps = {
  /** Color of the brightened lines/dots inside the cursor spotlight. */
  lineColor?: string;
  /** Color of the occasional cell pings. */
  pingColor?: string;
  /** Grid cell size in px — must match the underlying static grid. */
  cell?: number;
  variant?: 'lines' | 'dots';
};

/**
 * Sits on top of a section's static background grid and makes it feel alive:
 * a soft spotlight brightens the grid lines around the pointer, and every few
 * seconds a random cell "pings" — the same visual language as the hero shader.
 *
 * Deliberately cheap: CSS mask + custom properties (no WebGL, no per-frame
 * React work), all activity gated by an IntersectionObserver and disabled
 * under prefers-reduced-motion.
 */
export default function GridPulse({
  lineColor = 'rgba(230, 232, 230, 0.14)',
  pingColor = 'rgba(224, 27, 27, 0.5)',
  cell = 72,
  variant = 'lines',
}: GridPulseProps) {
  const { reducedMotion } = useApp();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const rushRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    const glow = glowRef.current;
    const rush = rushRef.current;
    if (!root || !glow || !rush) return;

    let active = false;
    let raf = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let px = 0;
    let py = 0;

    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (!active) glow.style.opacity = '0';
    });
    io.observe(root);

    // --- cursor spotlight (fine pointers only) ---
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const applyPointer = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const x = px - r.left;
      const y = py - r.top;
      if (x < -80 || y < -80 || x > r.width + 80 || y > r.height + 80) {
        glow.style.opacity = '0';
        return;
      }
      glow.style.setProperty('--gx', `${x}px`);
      glow.style.setProperty('--gy', `${y}px`);
      glow.style.opacity = '1';
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        glow.style.opacity = '0';
      }, 1400);
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(applyPointer);
    };
    if (finePointer) window.addEventListener('pointermove', onMove, { passive: true });

    // --- occasional cell pings ---
    const spawnPing = () => {
      if (!active || document.hidden) return;
      const r = root.getBoundingClientRect();
      const cols = Math.floor(r.width / cell);
      const rows = Math.floor(r.height / cell);
      if (cols < 2 || rows < 2) return;
      const size = variant === 'dots' ? Math.max(4, cell * 0.18) : Math.max(8, cell * 0.14);
      const col = 1 + Math.floor(Math.random() * (cols - 1));
      const row = 1 + Math.floor(Math.random() * (rows - 1));
      const ping = document.createElement('span');
      ping.className = styles.ping;
      ping.style.left = `${col * cell - size / 2}px`;
      ping.style.top = `${row * cell - size / 2}px`;
      ping.style.width = `${size}px`;
      ping.style.height = `${size}px`;
      ping.style.background = pingColor;
      root.appendChild(ping);
      ping.addEventListener('animationend', () => ping.remove());
    };
    const pingInterval = setInterval(spawnPing, 2600 + Math.random() * 900);

    // --- scroll shimmer: grid lines glint awake with scroll velocity ---
    let rushOpacity = 0;
    let rushRaf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let lastRushPing = 0;

    const decay = () => {
      rushOpacity *= 0.9;
      if (rushOpacity < 0.02) {
        rushOpacity = 0;
        rush.style.opacity = '0';
        rushRaf = 0;
        return;
      }
      rush.style.opacity = rushOpacity.toFixed(3);
      rushRaf = requestAnimationFrame(decay);
    };

    const onScroll = () => {
      if (!active) return;
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(now - lastT, 1);
      lastY = window.scrollY;
      lastT = now;
      const v = Math.abs(dy) / dt; // px per ms
      rushOpacity = Math.min(0.45, Math.max(rushOpacity, v * 0.18));
      if (!rushRaf) rushRaf = requestAnimationFrame(decay);
      // fast scrolling occasionally sparks an extra ping — "data activity"
      if (v > 1.4 && now - lastRushPing > 700) {
        lastRushPing = now;
        spawnPing();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      if (finePointer) window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (rushRaf) cancelAnimationFrame(rushRaf);
      if (idleTimer) clearTimeout(idleTimer);
      clearInterval(pingInterval);
    };
  }, [reducedMotion, cell, pingColor, variant]);

  if (reducedMotion) return null;

  const backgroundImage =
    variant === 'dots'
      ? `radial-gradient(${lineColor} 1.2px, transparent 1.2px)`
      : `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`;

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div
        ref={glowRef}
        className={styles.glow}
        style={{ backgroundImage, backgroundSize: `${cell}px ${cell}px` }}
      />
      <div
        ref={rushRef}
        className={styles.rush}
        style={{ backgroundImage, backgroundSize: `${cell}px ${cell}px` }}
      />
    </div>
  );
}
