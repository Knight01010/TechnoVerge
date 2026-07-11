'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/providers/AppProviders';
import styles from './Cursor.module.css';

/**
 * Custom crosshair cursor: 5px red dot follows the pointer instantly,
 * 34px difference-blend ring lerps behind it. Hovering `a, button,
 * [data-cursor]` grows the ring (54px, or 70px with an uppercase label).
 * Renders nothing on touch / no-hover devices.
 */
export default function Cursor() {
  const { reducedMotion } = useApp();
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  // Only exist for fine pointers that can hover (live-updated).
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    let mx = -100;
    let my = -100;
    let cx = -100;
    let cy = -100;
    let raf = 0;
    let running = false;
    // With reduced motion the ring snaps instead of trailing.
    const lerp = reducedMotion ? 1 : 0.16;

    // Both elements self-center via a trailing translate(-50%, -50%), so no
    // layout reads are needed and the ring stays centered while its width
    // transitions.
    const render = () => {
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    };

    // Self-stopping loop: once the ring has caught up with the pointer it
    // parks itself instead of burning frames at idle; mousemove restarts it.
    const loop = () => {
      cx += (mx - cx) * lerp;
      cy += (my - cy) * lerp;
      if (Math.abs(mx - cx) < 0.1 && Math.abs(my - cy) < 0.1) {
        cx = mx;
        cy = my;
        render();
        running = false;
        return;
      }
      render();
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      wake();
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const t = el?.closest('a, button, [data-cursor]') ?? null;
      if (t) {
        const text = t.getAttribute('data-cursor');
        ring.style.width = text ? '70px' : '54px';
        ring.style.height = text ? '70px' : '54px';
        label.textContent = text ?? '';
        label.style.opacity = text ? '1' : '0';
      } else {
        ring.style.width = '34px';
        ring.style.height = '34px';
        label.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    render();

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled, reducedMotion]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true">
        <span ref={labelRef} className={styles.label} />
      </div>
    </>
  );
}
