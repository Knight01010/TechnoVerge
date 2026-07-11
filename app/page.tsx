import Cursor from '@/components/Cursor';
import Preloader from '@/components/Preloader';
import Nav from '@/components/Nav';
import FullscreenMenu from '@/components/FullscreenMenu';
import Hero from '@/components/Hero';
import Ticker from '@/components/Ticker';
import Manifesto from '@/components/Manifesto';
import Practices from '@/components/Practices';
import Services from '@/components/Services';
import ProcessSection from '@/components/ProcessSection';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <div className="scanlines" aria-hidden="true" />
      <Cursor />
      <Preloader />
      <Nav />
      <FullscreenMenu />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Ticker />
        <Manifesto />
        <Practices />
        <Services />
        <ProcessSection />
        <Contact />
      </main>
    </>
  );
}
