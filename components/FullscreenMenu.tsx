'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useApp, useMenu } from '@/components/providers/AppProviders';
import { menuLinks, site } from '@/lib/content';
import { scramble } from '@/lib/scramble';
import GridPulse from '@/components/GridPulse';
import styles from './FullscreenMenu.module.css';

export default function FullscreenMenu() {
  const { reducedMotion } = useApp();
  const { menuOpen, closeMenu } = useMenu();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hoverBusy = useRef<boolean[]>([]);
  const hoverCleanups = useRef<(() => void)[]>([]);

  // Escape closes the menu while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  // Modal focus management: while open, move focus into the dialog, trap
  // Tab within it, and make the page behind it inert; on close, restore
  // focus to the trigger (the [ MENU ] button).
  useEffect(() => {
    if (!menuOpen) return;
    const root = rootRef.current;
    if (!root) return;

    const prevFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));
    focusables()[0]?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !root.contains(active)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      document.removeEventListener('keydown', onKey, true);
      main?.removeAttribute('inert');
      prevFocus?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  // Open animation: labels slide up (stagger), then scramble in sequence.
  useEffect(() => {
    if (!menuOpen || reducedMotion) return;
    const els = labelRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    );
    if (els.length === 0) return;

    const tween = gsap.fromTo(
      els,
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: 0.75,
        stagger: 0.07,
        delay: 0.18,
        ease: 'power4.out',
      },
    );

    const timeouts: number[] = [];
    const cancels: (() => void)[] = [];
    els.forEach((el, i) => {
      const label = menuLinks[i]?.label ?? '';
      timeouts.push(
        window.setTimeout(() => {
          cancels.push(scramble(el, label, 420));
        }, 260 + i * 75),
      );
    });

    return () => {
      tween.kill();
      timeouts.forEach((t) => window.clearTimeout(t));
      cancels.forEach((c) => c());
      els.forEach((el, i) => {
        el.textContent = menuLinks[i]?.label ?? '';
        gsap.set(el, { yPercent: 0 });
      });
    };
  }, [menuOpen, reducedMotion]);

  // Cancel any in-flight hover scrambles on unmount.
  useEffect(() => {
    const cleanups = hoverCleanups.current;
    return () => {
      cleanups.forEach((c) => c());
      cleanups.length = 0;
    };
  }, []);

  const handleEnter = useCallback(
    (i: number) => {
      if (reducedMotion) return;
      const el = labelRefs.current[i];
      if (!el || hoverBusy.current[i]) return;
      hoverBusy.current[i] = true;
      const cancel = scramble(el, menuLinks[i]?.label ?? '', 420);
      const t = window.setTimeout(() => {
        hoverBusy.current[i] = false;
      }, 500);
      // Store per-index so each new hover overwrites the previous entry,
      // keeping the array bounded at menuLinks.length.
      hoverCleanups.current[i] = () => {
        cancel();
        window.clearTimeout(t);
      };
    },
    [reducedMotion],
  );

  return (
    <div
      ref={rootRef}
      id="fullscreen-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!menuOpen}
      inert={!menuOpen}
      className={menuOpen ? `${styles.overlay} ${styles.open}` : styles.overlay}
    >
      {/* decor: 72px grid */}
      <div className={styles.grid} aria-hidden="true" />
      <GridPulse />

      {/* decor: giant watermark logo, right */}
      <div className={styles.watermark} aria-hidden="true">
        <Image
          src="/assets/logo-mark.png"
          alt=""
          width={95}
          height={119}
          className={styles.watermarkImg}
        />
      </div>

      {/* decor: red radial glow, bottom-left */}
      <div className={styles.glow} aria-hidden="true" />

      {/* decor: red scan line sweeping top -> bottom */}
      <div className={styles.scanline} aria-hidden="true" />

      {/* status readouts, top-right */}
      <div className={styles.status} aria-hidden="true">
        <span>
          CHANNEL <span className={styles.statusRed}>▮ ENCRYPTED</span>
        </span>
        <span>
          UPLINK <span className={styles.statusBright}>STABLE</span>
        </span>
        <span>
          NAV.SYS <span className={styles.statusBright}>v3.0</span>
        </span>
      </div>

      {menuLinks.map((ml, i) => (
        <a
          key={ml.num}
          href={ml.href}
          className={styles.link}
          data-cursor="GO"
          aria-label={ml.label}
          onClick={closeMenu}
          onMouseEnter={() => handleEnter(i)}
        >
          <span className={styles.num} aria-hidden="true">
            /{ml.num}
          </span>
          <span className={styles.labelMask}>
            <span
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className={styles.label}
            >
              {ml.label}
            </span>
          </span>
          <span className={styles.meta} aria-hidden="true">
            {ml.meta}
          </span>
        </a>
      ))}

      <div className={styles.foot}>
        <span>{site.email}</span>
        <span className={styles.footRight} aria-hidden="true">
          <span className={styles.footDot} />
          Advisory / Security / Infrastructure
        </span>
      </div>
    </div>
  );
}
