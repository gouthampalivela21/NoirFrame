import ScrollReveal from './ScrollReveal';
import { Heart, Lightbulb, MessageCircle, Zap } from 'lucide-react';

const reasons = [
  { icon: Heart, title: 'We care like it\'s our own brand', desc: 'Your project isn\'t just another task — we treat every brand like we\'re building our own reputation on it.' },
  { icon: Lightbulb, title: 'Fresh perspective, zero shortcuts', desc: 'We bring modern thinking and honest craft. No recycled templates, no copy-paste work.' },
  { icon: MessageCircle, title: 'Transparent from day one', desc: 'We\'ll tell you what works, what doesn\'t, and why — because trust is built on honesty, not promises.' },
  { icon: Zap, title: 'Hungry to prove ourselves', desc: 'We\'re early-stage and that\'s our advantage — we over-deliver because every project shapes our story.' },
];

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-32 md:py-44 grain layered-bg">
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[160px] -translate-y-1/2 pointer-events-none" />

      <div className="container max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">Why Us</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              Why work with us
            </h2>
            <p className="text-muted-foreground font-body text-lg font-light mt-6 max-w-2xl mx-auto">
              We may be new, but our standards aren't. Here's what makes us different.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 140}>
              <div className="glass card-hover rounded-lg p-10 group cursor-default h-full relative overflow-hidden flex gap-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-700 pointer-events-none" />
                <r.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1 relative z-10 transition-all duration-700 group-hover:scale-110" />
                <div className="relative z-10">
                  <h4 className="font-heading text-xl text-foreground mb-2">{r.title}</h4>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed font-light">{r.desc}</p>
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
