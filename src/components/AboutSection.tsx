import ScrollReveal from './ScrollReveal';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 md:py-44 grain layered-bg">
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[160px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />

      <div className="container max-w-5xl relative z-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <ScrollReveal>
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">About Us</span>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 leading-tight text-foreground heading-glow">
                Where vision meets precision
              </h2>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={300}>
              <p className="text-muted-foreground font-body leading-relaxed text-lg font-light">
                We're a small studio with big standards. We started Noir Frame because we believe every
                brand — no matter how early — deserves design that feels intentional, thoughtful, and real.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={450}>
              <p className="text-muted-foreground font-body leading-relaxed text-lg font-light mt-6">
                We don't promise overnight miracles. We promise honest work, clear communication, and
                designs crafted with the kind of care that makes people notice — and trust — your brand.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
