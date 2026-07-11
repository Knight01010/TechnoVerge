'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '@/components/providers/AppProviders';
import { site, footerLinks } from '@/lib/content';
import GridPulse from '@/components/GridPulse';
import styles from './Contact.module.css';

export default function Contact() {
  const { reducedMotion } = useApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const bigRef = useRef<HTMLDivElement | null>(null);
  const circId = 'contact-badge-circ';

  useEffect(() => {
    if (reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const big = bigRef.current;
      if (!big) return;
      gsap.fromTo(
        big,
        { y: 130, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'power4.out',
          scrollTrigger: { trigger: big, start: 'top 88%' },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="contact" ref={sectionRef} className={styles.section}>
      <div className={styles.grid} aria-hidden="true" />
      <GridPulse />
      <div className={styles.glow} aria-hidden="true" />

      {/* Rotating circular badge */}
      <div className={styles.badge} aria-hidden="true">
        <Image
          src="/assets/logo-mark.png"
          alt=""
          width={26}
          height={32}
          className={styles.badgeLogo}
        />
        <svg viewBox="0 0 100 100" className={styles.badgeRing}>
          <defs>
            <path
              id={circId}
              d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
            />
          </defs>
          <text className={styles.badgeText}>
            <textPath href={`#${circId}`}>
              initiate — contact — initiate —{' '}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Giant mailto block */}
      <a
        href={`mailto:${site.email}`}
        className={styles.mailto}
        data-cursor="EMAIL"
        aria-label={`Initiate contact — email ${site.email}`}
      >
        <div className={styles.label} aria-hidden="true">
          {'/// your move'}
        </div>
        <div ref={bigRef} className={styles.big} aria-hidden="true">
          <div className={styles.lineWrap}>
            <span className={styles.lineSolid}>Initiate</span>
          </div>
          <div className={styles.lineWrap}>
            <span className={styles.lineOutline}>
              contact
              <span className={styles.caret}>_</span>
            </span>
          </div>
        </div>
      </a>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.copyright}>
          <Image
            src="/assets/logo-mark.png"
            alt=""
            width={14}
            height={18}
            className={styles.footerLogo}
            aria-hidden="true"
          />
          © {site.year} {site.name}
        </span>
        <nav className={styles.footerNav} aria-label="Footer">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href} data-cursor="GO">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href={`mailto:${site.email}`}
          className={styles.footerEmail}
          data-cursor="EMAIL"
        >
          {site.email}
        </a>
      </footer>
    </section>
  );
}
