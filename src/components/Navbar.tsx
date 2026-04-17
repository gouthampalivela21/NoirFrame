import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        scrolled ? 'glass py-4 shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'py-6 bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between">
        <a href="#" className="font-heading text-2xl tracking-wider text-foreground">
          Noir <span className="text-primary">Frame</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-500"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={cn('block w-6 h-px bg-foreground transition-all duration-500', menuOpen && 'rotate-45 translate-y-[3.5px]')} />
            <span className={cn('block w-6 h-px bg-foreground transition-all duration-500', menuOpen && '-rotate-45 -translate-y-[3.5px]')} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] glass',
          menuOpen ? 'max-h-80 mt-4' : 'max-h-0'
        )}
      >
        <div className="container py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-body tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-500"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
