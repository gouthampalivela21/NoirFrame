import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}

export default function ScrollReveal({ children, className, delay = 0, direction = 'up' }: ScrollRevealProps) {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollReveal(0.05);

  const directionStyles = {
    up: isMobile ? 'translate-y-4' : 'translate-y-8',
    left: isMobile ? '-translate-x-4' : '-translate-x-8',
    right: isMobile ? 'translate-x-4' : 'translate-x-8',
    none: '',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]',
        isMobile ? 'duration-500' : 'duration-[900ms]',
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${directionStyles[direction]}`,
        className
      )}
      style={{ transitionDelay: isMobile ? `${Math.min(delay, 100)}ms` : `${delay}ms` }}
    >
      {children}
    </div>
  );
}