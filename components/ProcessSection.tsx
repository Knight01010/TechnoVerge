'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { processSteps } from '@/lib/content';
import { useApp } from '@/components/providers/AppProviders';
import styles from './ProcessSection.module.css';

const BINARY = [
  '01001101 01010011 00101111 00101111 01010100 01000101 01000011 01001000',
  '01001110 01001111 01010110 01000101 01010010 01000111 01000101 00101111',
  '01010011 01000101 01000011 01010101 01010010 01000101 00101111 00101111',
];

/**
 * "The protocol" vertical timeline: red rail fills with scroll progress,
 * steps light up as they cross 78% of the viewport.
 */
export default function ProcessSection() {
  const { reducedMotion } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLHeadingElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.fromTo(
          headRef.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.15,
            ease: 'power4.out',
            scrollTrigger: { trigger: headRef.current, start: 'top 88%' },
          },
        );
      }

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 75%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      stepRefs.current.forEach((el) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 78%',
          onEnter: () => el.classList.add(styles.stepOn),
          onLeaveBack: () => el.classList.remove(styles.stepOn),
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  const stepClass = reducedMotion
    ? `${styles.step} ${styles.stepOn}`
    : styles.step;

  return (
    <section id="process" ref={sectionRef} className={styles.section}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.binary} aria-hidden="true">
        <span className={`${styles.binaryCol} ${styles.binaryRed}`}>
          {BINARY[0]}
        </span>
        <span className={`${styles.binaryCol} ${styles.binaryMid}`}>
          {BINARY[1]}
        </span>
        <span className={`${styles.binaryCol} ${styles.binaryFaint}`}>
          {BINARY[2]}
        </span>
      </div>

      <div className={styles.inner}>
        <div className={styles.label}>{'/// the protocol'}</div>
        <h2 ref={headRef} className={styles.head}>
          A lifecycle,
          <br />
          not a <span className={styles.headAccent}>handoff.</span>
        </h2>

        <div className={styles.timeline}>
          <div className={styles.rail} aria-hidden="true" />
          <div
            ref={lineRef}
            className={
              reducedMotion
                ? `${styles.railFill} ${styles.railFillFull}`
                : styles.railFill
            }
            aria-hidden="true"
          />

          {processSteps.map((st, i) => (
            <div
              key={st.num}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className={stepClass}
            >
              <span className={styles.node} aria-hidden="true" />
              <span className={styles.stepNum}>[{st.num}]</span>
              <h3 className={styles.stepTitle}>{st.title}</h3>
              <p className={styles.stepDesc}>{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
