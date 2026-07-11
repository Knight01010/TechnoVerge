'use client';

import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { useApp } from '@/components/providers/AppProviders';
import styles from './HeroShader.module.css';

/**
 * Fullscreen-quad WebGL background for the hero section.
 * Faithful port of the design's `_setupShader` fragment (fbm base, drifting
 * 13x grid, red cell pings, scan beam, mouse glow, grain, vignette) with the
 * required quality upgrades: dpr cap 1.6, ResizeObserver sizing, rAF paused
 * when the tab is hidden or the canvas scrolls offscreen, full disposal on
 * unmount, and a static CSS fallback when WebGL fails or reduced motion is on.
 * three.js is imported on demand inside the effect so its ~550 KB chunk stays
 * out of the critical bundle — it loads while the boot preloader is up.
 */

const VERTEX_SHADER = 'void main(){gl_Position=vec4(position,1.0);}';

const FRAGMENT_SHADER = [
  'precision highp float;',
  'uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;uniform float uScroll;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);',
  ' return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
  'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}',
  'void main(){',
  ' vec2 uv=gl_FragCoord.xy/uRes.xy;',
  ' vec2 asp=vec2(uRes.x/uRes.y,1.0);',
  ' float t=uTime*0.05;',
  ' vec2 q=uv*asp;',
  ' float f=fbm(q*1.8+vec2(t,-t*.6));',
  ' vec3 base=vec3(0.02,0.024,0.028);',
  ' vec3 red=vec3(0.878,0.106,0.106);',
  ' vec3 col=base+f*f*0.07;',
  // drifting grid — uTime keeps it alive at rest; uScroll links it to the
  // page so the wireframe visibly answers scrolling
  ' vec2 g=q*13.0; g.y+=uTime*0.32+uScroll*2.2;',
  ' vec2 gf=abs(fract(g)-0.5);',
  ' float gl=(1.0-smoothstep(0.0,0.06,gf.x))+(1.0-smoothstep(0.0,0.06,gf.y));',
  ' col+=vec3(0.10,0.11,0.12)*gl*0.16*(0.35+f);',
  // red cell pings
  ' vec2 cell=floor(g);',
  ' float ping=step(0.992,hash(cell+floor(uTime*0.8)));',
  ' float inCell=(1.0-smoothstep(0.32,0.5,max(gf.x,gf.y)));',
  ' col+=red*ping*inCell*0.5;',
  // scan beam
  ' float scanPos=fract(uTime*0.06);',
  ' float scan=smoothstep(0.10,0.0,abs(uv.y-scanPos));',
  ' col+=red*scan*0.10;',
  ' float scanLine=smoothstep(0.0035,0.0,abs(uv.y-scanPos));',
  ' col+=red*scanLine*0.55;',
  // mouse glow
  ' float md=distance(uv*asp,uMouse*asp);',
  ' float glow=smoothstep(0.5,0.0,md);',
  ' col+=red*glow*(0.22+0.06*sin(uTime*1.4))*(f*0.8+0.4);',
  ' float grain=hash(uv*uRes.xy+uTime)*0.05;',
  ' col+=grain-0.025;',
  ' float vig=smoothstep(1.3,0.35,length(uv-0.5));',
  ' col*=vig*0.92+0.2;',
  ' gl_FragColor=vec4(col,1.0);}',
].join('\n');

type Uniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector2 };
  uRes: { value: THREE.Vector2 };
  uScroll: { value: number };
};

export default function HeroShader() {
  const { reducedMotion } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reducedMotion || failed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Dynamic import keeps the three.js chunk out of the initial bundle;
    // it resolves while the preloader still covers the hero.
    import('three')
      .then((THREE) => {
        if (cancelled) return;

        let renderer: THREE.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
        } catch {
          setFailed(true);
          return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const uniforms: Uniforms = {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uRes: { value: new THREE.Vector2(1, 1) },
          uScroll: { value: 0 },
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
        });
        const geometry = new THREE.PlaneGeometry(2, 2);
        scene.add(new THREE.Mesh(geometry, material));

        const size = () => {
          const parent = canvas.parentElement;
          const w = parent ? parent.clientWidth : window.innerWidth;
          const h = parent ? parent.clientHeight : window.innerHeight;
          if (w === 0 || h === 0) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
          renderer.setSize(w, h);
          // uRes must match gl_FragCoord's space (the drawing buffer, in
          // device pixels), not CSS pixels — otherwise uv spans 0..dpr and
          // the scan beam / mouse glow / vignette break on dpr > 1 displays.
          uniforms.uRes.value.set(canvas.width, canvas.height);
        };
        size();

        // Resize via ResizeObserver on the parent (hero section).
        const observed = canvas.parentElement ?? canvas;
        const ro = new ResizeObserver(size);
        ro.observe(observed);

        // Mouse target (lerped in the loop, 0.05 per frame as in the design).
        let tmx = 0.5;
        let tmy = 0.5;
        const onMouse = (e: MouseEvent) => {
          tmx = e.clientX / window.innerWidth;
          tmy = 1 - e.clientY / window.innerHeight;
        };
        window.addEventListener('mousemove', onMouse);

        // uScroll: hero scroll offset in viewport heights (design parity).
        const onScroll = () => {
          uniforms.uScroll.value =
            window.scrollY / Math.max(window.innerHeight, 1);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        // rAF loop — paused when the tab is hidden or the canvas is offscreen.
        let raf = 0;
        let running = false;
        let inView = true;
        let pageVisible = !document.hidden;
        let elapsed = 0;
        let lastNow = 0;

        const loop = () => {
          raf = requestAnimationFrame(loop);
          const now = performance.now();
          elapsed += (now - lastNow) / 1000;
          lastNow = now;
          uniforms.uTime.value = elapsed;
          uniforms.uMouse.value.x += (tmx - uniforms.uMouse.value.x) * 0.05;
          uniforms.uMouse.value.y += (tmy - uniforms.uMouse.value.y) * 0.05;
          renderer.render(scene, camera);
        };
        const start = () => {
          if (running) return;
          running = true;
          lastNow = performance.now();
          raf = requestAnimationFrame(loop);
        };
        const stop = () => {
          if (!running) return;
          running = false;
          cancelAnimationFrame(raf);
        };
        const sync = () => {
          if (inView && pageVisible) start();
          else stop();
        };

        const onVisibility = () => {
          pageVisible = !document.hidden;
          sync();
        };
        document.addEventListener('visibilitychange', onVisibility);

        const io = new IntersectionObserver((entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? true;
          sync();
        });
        io.observe(canvas);

        sync();

        cleanup = () => {
          stop();
          io.disconnect();
          ro.disconnect();
          document.removeEventListener('visibilitychange', onVisibility);
          window.removeEventListener('mousemove', onMouse);
          window.removeEventListener('scroll', onScroll);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
        };
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion, failed]);

  if (reducedMotion || failed) {
    return <div className={styles.fallback} aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
