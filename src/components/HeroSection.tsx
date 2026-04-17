import { useEffect, useState, useCallback } from 'react';
import heroBg from '@/assets/hero-bg.jpg';
import FloatingParticles from './FloatingParticles';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setLoaded(true);

    // Disable parallax on mobile for smooth scrolling
    if (isMobile) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <section className="relative h-screen overflow-hidden grain vignette">
      <div
        className="absolute inset-0 will-change-transform"
        style={isMobile ? undefined : { transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.2}px)` }}
      >
        <img
  src={heroBg}
  alt="Noir Frame Studio"
  width={1920}
  height={1080}
  className="w-full h-full object-cover"
  {...{ fetchpriority: "high" }}
  decoding="async"
/>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Particles disabled on mobile for performance */}
      <FloatingParticles count={35} />

      {/* Glow - simplified on mobile */}
      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none animate-glow-pulse" />
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
        <h1
          className={`font-heading text-[clamp(2rem,8vw,6rem)] sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] heading-glow transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <span className="text-gradient">Elegance in every pixel.</span>
          <br />
          <span className="text-foreground">Purpose in every detail.</span>
        </h1>

        <p
          className={`mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground font-body font-light tracking-wide max-w-2xl transition-all duration-[1500ms] delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          We design brands and digital experiences that feel refined, intentional, and unmistakably yours.
        </p>

        <a
          href="#contact"
          className={`mt-10 md:mt-12 px-8 py-4 border border-primary/30 text-primary font-body text-sm tracking-widest uppercase glow-button rounded-sm transition-all duration-[1500ms] delay-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Start Your Project
        </a>

        <div
          className={`absolute bottom-10 flex flex-col items-center gap-2 transition-all duration-[1500ms] delay-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-xs tracking-widest uppercase text-muted-foreground font-body">Scroll</span>
          <div className="w-px h-8 relative overflow-hidden">
            <div className="w-full h-3 bg-primary/60 animate-scroll-indicator absolute top-0" />
          </div>
        </div>
      </div>
    </section>
  );
}