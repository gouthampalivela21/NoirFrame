import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

import portfolio1 from '@/assets/portfolio-1.jpg';
import portfolio2 from '@/assets/portfolio-2.jpg';
import portfolio4 from '@/assets/portfolio-4.jpg';
import portfolio5 from '@/assets/portfolio-5.jpg';

type Category = 'all' | 'photography' | 'branding' | 'design';

interface PortfolioItem {
  src: string;
  title: string;
  category: 'photography' | 'branding' | 'design';
  aspect: 'tall' | 'wide' | 'square';
}

const items: PortfolioItem[] = [
  { src: portfolio1, title: 'Portrait & Editorial', category: 'photography', aspect: 'tall' },
  { src: portfolio2, title: 'Luxury Web Design', category: 'design', aspect: 'wide' },
  { src: portfolio4, title: 'Product Photography', category: 'photography', aspect: 'wide' },
  { src: portfolio5, title: 'Logo & Visual Identity', category: 'branding', aspect: 'tall' },
];

const filters: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Photography', value: 'photography' },
  { label: 'Branding', value: 'branding' },
  { label: 'Design', value: 'design' },
];

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter);

  return (
    <>
      <section id="portfolio" className="relative py-32 md:py-44 grain layered-bg">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[180px] pointer-events-none" />

        <div className="container max-w-7xl relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-body">What We Deliver</span>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl mt-4 text-foreground heading-glow">
                The quality you can expect
              </h2>
              <p className="mt-4 text-muted-foreground font-body max-w-xl mx-auto text-sm md:text-base">
                A glimpse into the kind of results we create — from brand identities to digital experiences.
              </p>
            </div>
          </ScrollReveal>

          {/* Filters */}
          <ScrollReveal delay={150}>
            <div className="mb-16 overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full justify-start md:justify-center gap-4 px-4 md:px-0">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={cn(
                    'shrink-0 whitespace-nowrap px-6 py-2 text-sm tracking-widest uppercase font-body rounded-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    activeFilter === f.value
                      ? 'border border-primary/40 text-primary glass-glow'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  )}
                >
                  {f.label}
                </button>
              ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((item, i) => (
              <ScrollReveal
                key={item.title}
                delay={i * 100}
                className={cn(
                  'transition-all duration-700',
                  item.aspect === 'tall' ? 'md:row-span-2' : '',
                  item.aspect === 'wide' && i === 0 ? 'lg:col-span-1' : ''
                )}
              >
                <div
                  className="relative overflow-hidden rounded-lg group cursor-pointer h-full min-h-[280px]"
                  onClick={() => setSelectedImage(item.src)}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-all duration-700 flex items-end p-6">
                    <div className="opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <span className="font-heading text-xl text-foreground">{item.title}</span>
                      <span className="block text-xs text-primary/70 uppercase tracking-widest mt-1 font-body">{item.category}</span>
                    </div>
                  </div>
                  {/* Bottom vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 section-divider" />
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Portfolio preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
          />
        </div>
      )}
    </>
  );
}