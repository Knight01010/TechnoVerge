'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import HeroShader from '@/components/HeroShader';
import { useApp } from '@/components/providers/AppProviders';
import { hero } from '@/lib/content';
import { scramble } from '@/lib/scramble';
import styles from './Hero.module.css';

export default function Hero() {
  const { loaderDone, reducedMotion } = useApp();
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const leadRef = useRef<HTMLSpanElement | null>(null);
  const accentRef = useRef<HTMLSpanElement | null>(null);
  const [subVisible, setSubVisible] = useState(false);

  // Headline scramble + sub reveal once the preloader is gone.
  useEffect(() => {
    if (!loaderDone) return;

    const cancels: Array<() => void> = [];
    const timers: number[] = [];

    if (!reducedMotion) {
      if (line1Ref.current) {
        cancels.push(scramble(line1Ref.current, hero.line1, 900));
      }
      timers.push(
        window.setTimeout(() => {
          // Scramble the two spans separately so the accent color markup
          // is never touched (no innerHTML swapping).
          if (leadRef.current) {
            cancels.push(scramble(leadRef.current, hero.line2Lead, 1000));
          }
          if (accentRef.current) {
            cancels.push(scramble(accentRef.current, hero.line2Accent, 1000));
          }
        }, 250),
      );
    }
    // Reduced motion: text appears immediately (next tick keeps the
    // state update out of the synchronous effect body).
    timers.push(
      window.setTimeout(() => setSubVisible(true), reducedMotion ? 0 : 700),
    );

    return () => {
      cancels.forEach((cancel) => cancel());
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [loaderDone, reducedMotion]);

  // Magnetic CTA: translate toward the cursor, spring back on leave.
  const onCtaMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.28;
    const y = (e.clientY - r.top - r.height / 2) * 0.32;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onCtaLeave = (e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
  };

  return (
    <section id="hero" className={styles.hero}>
      <HeroShader />

      <div className={styles.topLabels} aria-hidden="true">
        {hero.topLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className={styles.sysStatus} aria-hidden="true">
        <span>
          SYS.STATUS <span className={styles.sysRed}>&#9646; OPERATIONAL</span>
        </span>
        <span>
          THREAT SURFACE <span className={styles.sysBright}>MONITORED</span>
        </span>
        <span>
          MODE <span className={styles.sysBright}>ZERO-TRUST</span>
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          {hero.badge}
        </div>

        {/* Stable accessible name while the scramble animation mutates the
            visible spans (same pattern as the menu links). */}
        <h1
          className={styles.headline}
          aria-label={`${hero.line1} ${hero.line2Lead}${hero.line2Accent}`}
        >
          <span className={styles.lineWrap}>
            <span ref={line1Ref} className={styles.line}>
              {hero.line1}
            </span>
          </span>
          <span className={styles.lineWrap}>
            <span className={styles.line}>
              <span ref={leadRef}>{hero.line2Lead}</span>
              <span ref={accentRef} className={styles.accent}>
                {hero.line2Accent}
              </span>
            </span>
          </span>
        </h1>

        <div
          className={
            subVisible ? `${styles.sub} ${styles.subVisible}` : styles.sub
          }
        >
          <p className={styles.subCopy}>{hero.sub}</p>
          <a
            href="#contact"
            className={styles.cta}
            data-cursor="TALK"
            onMouseMove={onCtaMove}
            onMouseLeave={onCtaLeave}
          >
            {hero.cta}
          </a>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        &#9660; scroll
      </div>
    </section>
  );
}
