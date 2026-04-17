import ScrollReveal from './ScrollReveal';

export default function FooterSection() {
  return (
    <footer className="relative py-16 border-t border-border/50 grain">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <a href="#" className="font-heading text-xl tracking-wider text-foreground">
              Noir <span className="text-primary">Frame</span>
            </a>

            <div className="flex items-center gap-8">
              {['Instagram', 'Behance', 'Dribbble'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-500 tracking-wider"
                >
                  {link}
                </a>
              ))}
            </div>

            <p className="text-xs text-muted-foreground font-body">
              © 2026 Noir Frame. All rights reserved.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
