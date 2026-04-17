import ScrollReveal from './ScrollReveal';

export default function TrustStrip() {
  return (
    <section className="relative py-12 md:py-16 border-b border-border/30">
      <div className="container">
        <ScrollReveal>
          <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground font-body">
            Trusted by growing brands & founders
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
