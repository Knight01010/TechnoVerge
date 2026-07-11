'use client';

import { useEffect, useRef } from 'react';
import type Lenis from 'lenis';
import { useApp } from '@/components/providers/AppProviders';
import { ticker } from '@/lib/content';
import styles from './Ticker.module.css';

export default function Ticker() {
  const { lenisRef, reducedMotion } = useApp();
  const skewRef = useRef<HTMLDivElement | null>(null);

  // Skew the band with scroll velocity, springing back to rest.
  // The skew lives on a wrapper separate from the marquee track so the
  // CSS marquee animation and the JS skew transform never fight.
  useEffect(() => {
    if (reducedMotion) return;
    const el = skewRef.current;
    if (!el) return;

    let target = 0;
    let current = 0;
    let raf = 0;
    let attached: Lenis | null = null;

    const onScroll = (e: Lenis) => {
      target = -Math.max(-8, Math.min(8, (e.velocity || 0) * 0.55));
    };

    const loop = () => {
      // Lenis is created in the provider's effect, which runs after this
      // child effect — attach lazily once the instance exists.
      if (!attached && lenisRef.current) {
        attached = lenisRef.current;
        attached.on('scroll', onScroll);
      }
      target *= 0.92; // spring back toward rest
      current += (target - current) * 0.18;
      if (Math.abs(current) < 0.02 && Math.abs(target) < 0.02) {
        if (current !== 0) {
          current = 0;
          el.style.transform = 'skewX(0deg)';
        }
      } else {
        el.style.transform = `skewX(${current.toFixed(3)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (attached) attached.off('scroll', onScroll);
      el.style.transform = '';
    };
  }, [lenisRef, reducedMotion]);

  const text = `${ticker} `;

  return (
    <div className={styles.band}>
      <div ref={skewRef} className={styles.skew}>
        <div className={styles.track}>
          <span className={styles.item}>{text}</span>
          <span className={styles.item} aria-hidden="true">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
