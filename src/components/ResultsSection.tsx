import ScrollReveal from './ScrollReveal';

const promises = [
  {
    icon: '✦',
    title: 'Obsessive attention to detail',
    desc: 'Every pixel, every interaction, every word — crafted with precision to reflect your brand\'s true value.',
  },
  {
    icon: '◆',
    title: 'Strategy before design',
    desc: 'We don\'t start with colors. We start with your goals, your market, and your ideal clients.',
  },
  {
    icon: '◈',
    title: 'Built for real results',
    desc: 'Beautiful design that actually converts — because aesthetics without strategy is just decoration.',
  },
];

export default function ResultsSection() {
  return (
    <section className="relative py-28 md:py-36 grain layered-bg-alt">
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <div className="container max-w-5xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Our Promise</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              What you can expect
            </h2>
            <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto text-sm font-light">
              We're a young studio with senior-level craft. Here's what we stand behind — no inflated numbers, just honest commitment.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {promises.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 180}>
              <div className="text-center glass rounded-lg p-10 card-hover">
                <span className="text-3xl text-primary">{p.icon}</span>
                <h3 className="font-heading text-lg text-foreground mt-4">{p.title}</h3>
                <p className="text-muted-foreground font-body text-sm mt-3 font-light leading-relaxed">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={600}>
          <p className="text-center text-foreground/70 font-heading text-lg md:text-xl mt-16 italic">
            "Great design isn't an expense — it's the smartest investment your brand will ever make."
          </p>
        </ScrollReveal>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
