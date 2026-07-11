'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/components/providers/AppProviders';
import { bootLines, site } from '@/lib/content';
import styles from './Preloader.module.css';

/**
 * Full-screen boot-sequence overlay. Boot lines reveal one-by-one, a giant
 * percentage counts to 100 in random increments, then the panel slides up
 * and `setLoaderDone(true)` is fired before unmounting.
 * Reduced motion skips straight to done.
 */
export default function Preloader() {
  const { setLoaderDone, reducedMotion } = useApp();
  const [pct, setPct] = useState(0);
  const [bootCount, setBootCount] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [hidden, setHidden] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (hidden) return;

    if (reducedMotion) {
      finishedRef.current = true;
      const skip = window.setTimeout(() => {
        setLoaderDone(true);
        setHidden(true);
      }, 0);
      return () => window.clearTimeout(skip);
    }

    const timeouts: number[] = [];

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPct(100);
      setBootCount(bootLines.length);
      timeouts.push(
        window.setTimeout(() => {
          setSliding(true);
          timeouts.push(
            window.setTimeout(() => {
              setLoaderDone(true);
              setHidden(true);
            }, 850),
          );
        }, 300),
      );
    };

    // Boot lines reveal one-by-one.
    const bootInt = window.setInterval(() => {
      setBootCount((c) => {
        if (c >= bootLines.length) {
          window.clearInterval(bootInt);
          return c;
        }
        return c + 1;
      });
    }, 260);

    // Percentage counter in random increments.
    let p = 0;
    const pctInt = window.setInterval(() => {
      p = Math.min(100, p + Math.floor(Math.random() * 13) + 4);
      setPct(p);
      if (p >= 100) {
        window.clearInterval(pctInt);
        finish();
      }
    }, 95);

    // Failsafe: never trap the page if a timer misfires.
    const failsafe = window.setTimeout(finish, 6000);

    return () => {
      window.clearInterval(bootInt);
      window.clearInterval(pctInt);
      window.clearTimeout(failsafe);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [reducedMotion, hidden, setLoaderDone]);

  if (hidden) return null;

  const tagParts = site.tagline.split(' × ');

  return (
    <div className={`${styles.root} ${sliding ? styles.up : ''}`}>
      <span className="sr-only">Loading {site.name}</span>
      <div aria-hidden="true" className={styles.topRow}>
        <span className={styles.brand}>
          <Image
            src="/assets/logo-mark.png"
            alt=""
            width={18}
            height={22}
            className={styles.logo}
          />
          {site.name}
        </span>
        <span className={styles.boot}>{'●'} BOOT</span>
      </div>
      <div aria-hidden="true" className={styles.lines}>
        {bootLines.map((bl, i) => (
          <div
            key={bl.text}
            className={i < bootCount ? styles.lineOn : styles.line}
          >
            <span className={styles.prompt}>&gt;</span> {bl.text}{' '}
            <span className={styles.status}>{bl.status}</span>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className={styles.bottom}>
        <div className={styles.pct}>
          {pct}
          <span className={styles.pctSign}>%</span>
        </div>
        <div className={styles.tagline}>
          {tagParts.length === 2 ? (
            <>
              {tagParts[0]} {'×'}
              <br />
              {tagParts[1]}
            </>
          ) : (
            site.tagline
          )}
        </div>
      </div>
    </div>
  );
}
