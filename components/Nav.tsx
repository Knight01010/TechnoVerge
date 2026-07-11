'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/components/providers/AppProviders';
import { site } from '@/lib/content';
import styles from './Nav.module.css';

export default function Nav() {
  const { menuOpen, toggleMenu } = useApp();
  const [clock, setClock] = useState('');

  // Live clock — updates every 30s.
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setClock(`${hh}:${mm} // SECURE`);
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <a
        href="#hero"
        className={styles.logo}
        data-cursor=""
        aria-label={`${site.name} — home`}
      >
        <Image
          src="/assets/logo-mark.png"
          alt=""
          width={95}
          height={119}
          className={styles.logoImg}
          priority
        />
      </a>

      <nav
        className={menuOpen ? `${styles.bar} ${styles.barMenuOpen}` : styles.bar}
        aria-label="Primary"
      >
        <a href="#hero" className={styles.wordmark} data-cursor="">
          {site.name.toUpperCase()}
          <span className={styles.underscore}>_</span>
        </a>

        <div className={styles.right}>
          <span className={styles.clock} aria-hidden="true">
            <span className={styles.clockDot} />
            {clock}
          </span>
          <button
            type="button"
            className={
              menuOpen ? `${styles.menuBtn} ${styles.menuBtnOpen}` : styles.menuBtn
            }
            onClick={toggleMenu}
            data-cursor="MENU"
            aria-expanded={menuOpen}
            aria-controls="fullscreen-menu"
          >
            [ {menuOpen ? 'CLOSE' : 'MENU'} ]
          </button>
        </div>
      </nav>
    </>
  );
}
