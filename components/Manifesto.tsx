'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { manifestoText } from '@/lib/content';
import { useApp } from '@/components/providers/AppProviders';
import GridPulse from '@/components/GridPulse';
import styles from './Manifesto.module.css';

type Word = { text: string; accent: boolean };

const WORDS: Word[] = manifestoText.split(' ').map((raw) => ({
  text: raw.replace(/\*/g, ''),
  accent: raw.includes('*'),
}));

export default function Manifesto() {
  const { reducedMotion } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const words = wordRefs.current;
    const bar = barRef.current;

    if (reducedMotion) {
      // No scrub: everything fully lit and readable.
      words.forEach((el) => el?.classList.add(styles.on));
      if (bar) bar.style.width = '100%';
      return () => {
        words.forEach((el) => el?.classList.remove(styles.on));
        if (bar) bar.style.width = '0%';
      };
    }

    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const lit: boolean[] = new Array(words.length).fill(false);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          const threshold = p * (words.length + 4);
          for (let i = 0; i < words.length; i++) {
            const el = words[i];
            if (!el) continue;
            const on = i < threshold;
            if (lit[i] !== on) {
              lit[i] = on;
              el.classList.toggle(styles.on, on);
            }
          }
          if (bar) bar.style.width = `${p * 100}%`;
        },
      });
    }, section);

    return () => {
      ctx.revert();
      words.forEach((el) => el?.classList.remove(styles.on));
      if (bar) bar.style.width = '0%';
    };
  }, [reducedMotion]);

  return (
    <section id="manifesto" ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>
        <div className={styles.grid} aria-hidden="true" />
        <GridPulse />

        <div className={styles.label} aria-hidden="true">
          {'/// threat report — keep scrolling'}
        </div>

        {/* Radar decor */}
        <div className={styles.radar} aria-hidden="true">
          <svg viewBox="0 0 200 200" className={styles.radarSvg}>
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="rgba(230,232,230,.09)"
              strokeWidth="0.6"
            />
            <circle
              cx="100"
              cy="100"
              r="64"
              fill="none"
              stroke="rgba(230,232,230,.08)"
              strokeWidth="0.6"
            />
            <circle
              cx="100"
              cy="100"
              r="32"
              fill="none"
              stroke="rgba(230,232,230,.07)"
              strokeWidth="0.6"
            />
            <line
              x1="4"
              y1="100"
              x2="196"
              y2="100"
              stroke="rgba(230,232,230,.06)"
              strokeWidth="0.6"
            />
            <line
              x1="100"
              y1="4"
              x2="100"
              y2="196"
              stroke="rgba(230,232,230,.06)"
              strokeWidth="0.6"
            />
            <circle cx="128" cy="62" r="2.4" fill="#E01B1B" />
            <circle cx="58" cy="140" r="1.8" fill="rgba(224,27,27,.55)" />
            <circle cx="152" cy="128" r="1.5" fill="rgba(230,232,230,.35)" />
          </svg>
          <div
            className={styles.sweep}
            style={{ animation: 'spinSlow 5.5s linear infinite' }}
          />
        </div>

        <p className={styles.para}>
          {WORDS.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className={
                w.accent ? `${styles.word} ${styles.accent}` : styles.word
              }
            >
              {w.text}
            </span>
          ))}
        </p>

        <div className={styles.scan} aria-hidden="true">
          <span>SCAN</span>
          <div className={styles.scanTrack}>
            <div ref={barRef} className={styles.scanFill} />
          </div>
        </div>
      </div>
    </section>
  );
}
