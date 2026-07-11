'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type AppContextValue = {
  /** Lenis instance ref — may be null before mount or when reduced motion. */
  lenisRef: React.RefObject<Lenis | null>;
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  /** True once the boot preloader has fully slid away. */
  loaderDone: boolean;
  setLoaderDone: (v: boolean) => void;
  /** Curtain page transition to an in-page anchor, e.g. navigateTo('#contact'). */
  navigateTo: (hash: string) => void;
  reducedMotion: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProviders>');
  return ctx;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const curtainBusy = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Reduced-motion preference (live).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Custom-cursor body flag (Cursor component renders only for fine pointers,
  // but the CSS cursor:none must be gated the same way).
  useEffect(() => {
    document.body.classList.add('custom-cursor');
    return () => document.body.classList.remove('custom-cursor');
  }, []);

  // Lenis + ScrollTrigger integration.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reducedMotion) return;

    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  // Menu open locks scrolling.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen]);

  const navigateTo = useCallback(
    (hash: string) => {
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;

      const jump = () => {
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
        else el.scrollIntoView();
        ScrollTrigger.update();
      };

      const curtain = curtainRef.current;
      if (reducedMotion || !curtain) {
        setMenuOpen(false);
        jump();
        return;
      }
      if (curtainBusy.current) return;
      curtainBusy.current = true;
      setMenuOpen(false);

      gsap
        .timeline({
          onComplete: () => {
            curtainBusy.current = false;
          },
        })
        .set(curtain, { yPercent: 101 })
        .to(curtain, { yPercent: 0, duration: 0.55, ease: 'power4.inOut' })
        .add(jump)
        .to(curtain, {
          yPercent: -101,
          duration: 0.6,
          ease: 'power4.inOut',
          delay: 0.15,
        })
        .set(curtain, { yPercent: 101 });
    },
    [reducedMotion],
  );

  // Global anchor interception: any <a href="#..."> gets the curtain transition.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const target = e.target as HTMLElement;
      const a = target.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      e.preventDefault();
      navigateTo(hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigateTo]);

  const value = useMemo(
    () => ({
      lenisRef,
      menuOpen,
      toggleMenu,
      closeMenu,
      loaderDone,
      setLoaderDone,
      navigateTo,
      reducedMotion,
    }),
    [menuOpen, toggleMenu, closeMenu, loaderDone, navigateTo, reducedMotion],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Page-transition curtain */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8000,
          background: 'var(--red)',
          transform: 'translateY(101%)',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          pointerEvents: 'none',
        }}
      >
        <Image
          src="/assets/logo-mark-black.png"
          alt=""
          width={44}
          height={56}
          style={{ height: 56, width: 'auto' }}
        />
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(5,6,7,.7)',
          }}
        >
          rerouting…
        </span>
      </div>
    </AppContext.Provider>
  );
}
