'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { services, servicesCta } from '@/lib/content';
import { useApp } from '@/components/providers/AppProviders';
import styles from './Services.module.css';

/**
 * Horizontal-scroll "Engagement modules" section.
 * The section grows vertically by the track's horizontal overflow (+96px pad),
 * a sticky 100svh viewport pins the track, and a scrubbed ScrollTrigger
 * translates the track left as the user scrolls through the extra height.
 */
export default function Services() {
  const { reducedMotion } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const extra = () =>
      Math.max(track.scrollWidth - window.innerWidth + 96, 0);
    const size = () => {
      section.style.height = `${window.innerHeight + extra()}px`;
    };
    size();

    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.fromTo(
          headRef.current,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.15,
            ease: 'power4.out',
            scrollTrigger: { trigger: headRef.current, start: 'top 88%' },
          },
        );
      }

      gsap.to(track, {
        x: () => -extra(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    // Keep the section height in sync before ScrollTrigger measures.
    // (ScrollTrigger's own debounced resize refresh + invalidateOnRefresh
    // handle window resizes — no manual resize listener needed.)
    const onRefreshInit = () => size();
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);

    // Keyboard focus (Tab to the CTA card) makes the browser scroll the
    // overflow-hidden viewport, desyncing it from the scrubbed transform.
    // Undo that scroll and seek the page to the scrub position instead.
    const onFocusIn = (e: FocusEvent) => {
      viewport.scrollLeft = 0;
      const el = e.target instanceof HTMLElement ? e.target : null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.left < 0 || rect.right > window.innerWidth) {
        window.scrollTo(0, section.offsetTop + extra());
      }
    };
    viewport.addEventListener('focusin', onFocusIn);

    return () => {
      viewport.removeEventListener('focusin', onFocusIn);
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ctx.revert();
      section.style.height = '';
    };
  }, [reducedMotion]);

  const sectionClass = reducedMotion
    ? `${styles.section} ${styles.static}`
    : styles.section;

  return (
    <section id="services" ref={sectionRef} className={sectionClass}>
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.dots} aria-hidden="true" />
        <div className={styles.ghost} aria-hidden="true">
          MODULES///
        </div>

        <div className={styles.header}>
          <h2 ref={headRef} className={styles.title}>
            Engagement <span className={styles.titleAccent}>modules</span>
          </h2>
          <span className={styles.hint} aria-hidden="true">
            scroll → sideways
          </span>
        </div>

        <div ref={trackRef} className={styles.track}>
          {services.map((svc) => (
            <div key={svc.id} className={styles.card} data-cursor="+">
              <span className={styles.cornerTL} aria-hidden="true" />
              <span className={styles.cornerBR} aria-hidden="true" />
              <div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardId}>SVC/{svc.id}</span>
                  <span className={styles.cardTag}>{svc.tag}</span>
                </div>
                <h3 className={styles.cardName}>{svc.name}</h3>
                <p className={styles.cardPurpose}>{svc.purpose}</p>
              </div>
              <div className={styles.cardRuntime}>
                runtime: {svc.duration}
              </div>
            </div>
          ))}

          <a href="#contact" className={styles.ctaCard} data-cursor="TALK">
            <span className={styles.ctaId}>{servicesCta.id}</span>
            <span className={styles.ctaText}>{servicesCta.text}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
