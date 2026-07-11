/**
 * Text "decrypt" scramble effect. Progressively locks characters of
 * `finalText` left-to-right while unlocked characters cycle through
 * glyph noise. Returns a cancel function.
 */
const GLYPHS = '!<>-_\\/[]{}=+*^?#010101';

export function scramble(
  el: HTMLElement,
  finalText: string,
  duration = 600,
  onDone?: () => void,
): () => void {
  const len = finalText.length;
  const start = performance.now();
  let raf = 0;
  let last = 0;

  const frame = (now: number) => {
    // throttle to ~30fps so glyph noise is readable
    if (now - last >= 34) {
      last = now;
      const p = Math.min(1, (now - start) / duration);
      const lock = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        if (i < lock || finalText[i] === ' ') out += finalText[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (p >= 1) {
        el.textContent = finalText;
        onDone?.();
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
