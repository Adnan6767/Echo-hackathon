import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { SceneHero } from '../components/landing/SceneHero';
import { SceneProblem } from '../components/landing/SceneProblem';
import { SceneTransformation } from '../components/landing/SceneTransformation';
import { SceneHowItWorks } from '../components/landing/SceneHowItWorks';
import { SceneProductPreview } from '../components/landing/SceneProductPreview';
import { SceneBeyondKirana } from '../components/landing/SceneBeyondKirana';
import { SceneFinalCTA } from '../components/landing/SceneFinalCTA';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger once fonts/images settle
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <MarketingLayout>
      <SceneHero />
      <SceneProblem />
      <SceneTransformation />
      <SceneHowItWorks />
      <SceneProductPreview />
      <SceneBeyondKirana />
      <SceneFinalCTA />
    </MarketingLayout>
  );
}
