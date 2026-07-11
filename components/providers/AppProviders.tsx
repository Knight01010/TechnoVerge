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
  /** True once the boot preloader has fully slid away. */
  loaderDone: boolean;
  setLoaderDone: (v: boolean) => void;
  /** Curtain page transition to an in-page anchor, e.g. navigateTo('#contact'). */
  navigateTo: (hash: string) => void;
  reducedMotion: boolean;
};

type MenuContextValue = {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

// Menu state lives in its own context so toggling the menu only re-renders
// the components that actually read it (Nav, FullscreenMenu) instead of
// every useApp() consumer on the page.
const MenuContext = createContext<MenuContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProviders>');
  return ctx;
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within <AppProviders>');
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

  // Menu open locks scrolling. Lenis only virtualizes wheel/touch (and is
  // never created under reduced motion), so always apply a native overflow
  // lock too — it covers keyboard and scrollbar scrolling.
  useEffect(() => {
    const lenis = lenisRef.current;
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) lenis?.stop();
    else lenis?.start();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  const navigateTo = useCallback(
    (hash: string) => {
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;

      const jump = () => {
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
        else el.scrollIntoView();
        // Move keyboard focus to the target (native fragment navigation is
        // preventDefault-ed by the interceptor) and reflect the hash in the
        // URL so :target, deep-linking and Back keep working.
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
        window.history.pushState(null, '', hash);
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
      // Let the accessibility skip link use native fragment navigation —
      // a curtain transition would defeat its purpose.
      if (a.classList.contains('skip-link')) return;
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
      loaderDone,
      setLoaderDone,
      navigateTo,
      reducedMotion,
    }),
    [loaderDone, navigateTo, reducedMotion],
  );

  const menuValue = useMemo(
    () => ({ menuOpen, toggleMenu, closeMenu }),
    [menuOpen, toggleMenu, closeMenu],
  );

  return (
    <AppContext.Provider value={value}>
      <MenuContext.Provider value={menuValue}>
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
      </MenuContext.Provider>
    </AppContext.Provider>
  );
}
