import ScrollReveal from './ScrollReveal';

const steps = [
  { num: '01', title: 'Discovery & Strategy', desc: 'We dive deep into your brand, market, and goals to build a strategy that positions you for premium pricing.' },
  { num: '02', title: 'Design & Craft', desc: 'Every pixel is intentional. We create bespoke designs that communicate authority and trust.' },
  { num: '03', title: 'Launch & Growth', desc: 'We launch with precision and provide insights to ensure your investment delivers measurable returns.' },
];

export default function ProcessSection() {
  return (
    <section id="process" className="relative py-32 md:py-44 grain layered-bg-alt">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />

      <div className="container max-w-4xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Process</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              How we deliver
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent md:-translate-x-px" />

          <div className="space-y-24">
            {steps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 250}>
                <div className={`relative flex items-start gap-8 md:gap-16 ${i % 2 === 1 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full glass glass-glow flex items-center justify-center transition-all duration-700 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]">
                    <span className="font-heading text-xl text-primary">{step.num}</span>
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground font-body font-light leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
