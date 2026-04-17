import ScrollReveal from './ScrollReveal';

const testimonials = [
  {
    quote: 'Noir Frame didn\'t just redesign our website — they repositioned our entire brand. We went from competing on price to commanding premium rates overnight.',
    author: 'Sophia Laurent',
    role: 'Founder, Maison Luxe',
  },
  {
    quote: 'The ROI was immediate. Within 60 days of launch, our conversion rate tripled and our average deal size increased by 40%.',
    author: 'Marcus Chen',
    role: 'CEO, Atlas Digital',
  },
  {
    quote: 'Working with Noir Frame felt like hiring a creative partner, not an agency. Every detail was obsessively refined. Our clients now see us as the premium choice.',
    author: 'Elena Vasquez',
    role: 'Brand Director, Noir Collective',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 md:py-44 grain layered-bg">
      <div className="container max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Client Stories</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              Transformations, not testimonials
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.author} delay={i * 180}>
              <div className="glass card-hover rounded-lg p-8 h-full flex flex-col relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-700 pointer-events-none" />
                <p className="font-body text-foreground/80 leading-relaxed italic flex-1 relative z-10">
                  "{t.quote}"
                </p>
                <div className="mt-8 pt-6 border-t border-border relative z-10">
                  <p className="font-heading text-foreground">{t.author}</p>
                  <p className="text-sm text-muted-foreground font-body mt-1">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
