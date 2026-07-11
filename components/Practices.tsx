'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { practices, practiceThemes } from '@/lib/content';
import { useApp } from '@/components/providers/AppProviders';
import GridPulse from '@/components/GridPulse';
import styles from './Practices.module.css';

export default function Practices() {
  const { reducedMotion } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const title = titleRefs.current[i];
        const body = bodyRefs.current[i];
        const num = numRefs.current[i];

        if (title) {
          gsap.fromTo(
            title,
            { y: 110, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: 'power4.out',
              scrollTrigger: { trigger: panel, start: 'top 62%' },
            },
          );
        }
        if (body) {
          gsap.fromTo(
            body,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              delay: 0.15,
              ease: 'power3.out',
              scrollTrigger: { trigger: panel, start: 'top 62%' },
            },
          );
        }
        if (num) {
          gsap.fromTo(
            num,
            { y: 80 },
            {
              y: -20,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        }

        const prev = panelRefs.current[i - 1];
        if (i > 0 && prev) {
          gsap.fromTo(
            prev,
            { scale: 1, filter: 'brightness(1)' },
            {
              scale: 0.93,
              filter: 'brightness(0.5)',
              transformOrigin: '50% 25%',
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'top top',
                scrub: true,
              },
            },
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="practices" ref={sectionRef} className={styles.section}>
      {practices.map((pr, i) => {
        const t = practiceThemes[i % practiceThemes.length];
        const vars = {
          '--p-bg': t.bg,
          '--p-ink': t.ink,
          '--p-sub': t.sub,
          '--p-line': t.line,
          '--p-num': t.num,
          '--p-grid': t.grid,
          '--p-corner': t.corner,
          '--p-motif': t.motif,
        } as CSSProperties;

        return (
          <div
            key={pr.num}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={styles.panel}
            style={vars}
          >
            <div className={styles.grid} aria-hidden="true" />
            <GridPulse
              lineColor={
                i === 1 ? 'rgba(5, 6, 7, 0.18)' : 'rgba(230, 232, 230, 0.14)'
              }
              pingColor={
                i === 1 ? 'rgba(5, 6, 7, 0.5)' : 'rgba(224, 27, 27, 0.5)'
              }
            />

            {/* Circuit-diagram motif */}
            <div
              className={styles.motif}
              aria-hidden="true"
              style={{ transform: `rotate(${i * 14 - 8}deg)` }}
            >
              <svg viewBox="0 0 400 260" className={styles.motifSvg}>
                <g fill="none" stroke="currentColor" strokeWidth="1">
                  <path
                    d="M20,220 L120,140 L240,190 L330,80 L390,120"
                    strokeDasharray="5 7"
                    style={{ animation: 'dashMove 8s linear infinite' }}
                  />
                  <path
                    d="M60,40 L120,140 M240,190 L250,250 M330,80 L300,20 M120,140 L60,40"
                    strokeDasharray="5 7"
                    style={{ animation: 'dashMove 11s linear infinite' }}
                  />
                  <circle cx="120" cy="140" r="22" strokeDasharray="3 5" />
                  <circle
                    cx="330"
                    cy="80"
                    r="30"
                    strokeDasharray="3 5"
                    style={{ animation: 'dashMove 14s linear infinite' }}
                  />
                </g>
                <g fill="currentColor">
                  <rect x="116" y="136" width="8" height="8" />
                  <rect x="236" y="186" width="8" height="8" />
                  <rect x="326" y="76" width="8" height="8" />
                  <rect x="16" y="216" width="8" height="8" />
                  <rect x="296" y="16" width="8" height="8" />
                  <rect x="386" y="116" width="8" height="8" />
                  <rect x="246" y="246" width="8" height="8" />
                  <rect x="56" y="36" width="8" height="8" />
                </g>
              </svg>
            </div>

            <span className={styles.cornerTL} aria-hidden="true" />
            <span className={styles.cornerBR} aria-hidden="true" />

            <div className={styles.panelInner}>
            <div className={styles.topRow}>
              <span
                ref={(el) => {
                  numRefs.current[i] = el;
                }}
                className={styles.num}
                aria-hidden="true"
              >
                {pr.num}
              </span>
              <span className={styles.tag}>{pr.tag}</span>
            </div>

            <div className={styles.bottomRow}>
              <h2
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className={styles.title}
              >
                {pr.title}
              </h2>
              <div
                ref={(el) => {
                  bodyRefs.current[i] = el;
                }}
                className={styles.body}
              >
                <p className={styles.desc}>{pr.desc}</p>
                <div className={styles.chips}>
                  {pr.chips.map((ch) => (
                    <span key={ch} className={styles.chip}>
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
