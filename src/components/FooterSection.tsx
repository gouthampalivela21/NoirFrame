import ScrollReveal from './ScrollReveal';

export default function FooterSection() {
  const socialLinks = [
    { name: "Instagram", url: "https://instagram.com/noirframe.01" }
  ];

  return (
    <footer className="relative py-16 border-t border-border/50 grain">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo */}
            <a href="#" className="font-heading text-xl tracking-wider text-foreground">
              Noir <span className="text-primary">Frame</span>
            </a>

            {/* Social Links */}
            <div className="flex items-center gap-8">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-500 tracking-wider relative group"
                >
                  {link.name}
                  
                  {/* Premium underline animation */}
                  <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground font-body">
              © 2026 Noir Frame. All rights reserved.
            </p>

          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}