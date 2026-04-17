import ScrollReveal from './ScrollReveal';
import { Globe, Sparkles, BarChart3, Camera } from 'lucide-react';

const services = [
  {
    icon: Globe,
    title: 'Premium Website Experience',
    desc: 'Bespoke digital experiences that position your brand as a market leader — designed to convert visitors into high-value clients.',
  },
  {
    icon: Sparkles,
    title: 'Luxury Brand Identity',
    desc: 'From visual language to brand strategy — we build identities that command premium pricing and lasting recognition.',
  },
  {
    icon: BarChart3,
    title: 'Conversion-Focused UI/UX',
    desc: 'Data-driven interfaces engineered for growth. Every element serves a purpose: turning attention into revenue.',
  },
  {
    icon: Camera,
    title: 'Cinematic Visual Storytelling',
    desc: 'Editorial photography and motion that elevate your brand narrative — making your audience feel, not just see.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-32 md:py-44 grain layered-bg-alt">
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />

      <div className="container max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">What We Deliver</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
              Results, not just design
            </h2>
            <p className="text-muted-foreground font-body text-lg font-light mt-6 max-w-2xl mx-auto">
              We design digital experiences that elevate brands into premium identities.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 120}>
              <div className="glass card-hover rounded-lg p-10 group cursor-default h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-700 pointer-events-none" />
                <item.icon className="w-8 h-8 text-primary mb-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                <h4 className="font-heading text-2xl text-foreground mb-3 relative z-10">{item.title}</h4>
                <p className="text-muted-foreground font-body text-sm leading-relaxed font-light relative z-10">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
}
