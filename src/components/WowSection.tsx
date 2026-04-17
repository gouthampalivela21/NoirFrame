import { useEffect, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import wowBg from '@/assets/wow-bg.jpg';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function WowSection() {
  const [scrollY, setScrollY] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return; // No parallax on mobile

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
    <section className="relative h-screen overflow-hidden grain vignette flex items-center justify-center">
      <div
        className="absolute inset-0 will-change-transform"
        style={isMobile ? undefined : { transform: `translateY(${(scrollY - 2000) * 0.15}px) scale(${1 + Math.max(0, scrollY - 1800) * 0.0002})` }}
      >
        <img
          src={wowBg}
          alt="Cinematic landscape"
          loading="lazy"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${
        isMobile ? 'w-[250px] h-[250px] bg-primary/5 blur-[80px]' : 'w-[500px] h-[500px] bg-primary/8 blur-[160px] animate-glow-pulse'
      }`} />

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <ScrollReveal>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-8xl text-foreground leading-tight italic heading-glow">
            We don't just design.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={isMobile ? 200 : 400}>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-8xl text-primary leading-tight italic mt-4 heading-glow">
            We create obsession.
          </h2>
        </ScrollReveal>
      </div>
    </section>
  );
}
