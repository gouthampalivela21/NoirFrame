import { useEffect, useState, memo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'fadeOut' | 'done'>('logo');
  const isMobile = useIsMobile();

  // Shorter loading screen on mobile
  const fadeStart = isMobile ? 600 : 1200;
  const doneAt = isMobile ? 1000 : 1800;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadeOut'), fadeStart);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, doneAt);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete, fadeStart, doneAt]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === 'logo' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="w-16 h-16 border border-primary/40 rotate-45 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rotate-0" />
          </div>
        </div>

        <h1
          className={`font-heading text-3xl md:text-4xl tracking-widest uppercase text-foreground transition-all duration-[1000ms] delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase === 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Noir Frame
        </h1>

        <div className="w-32 h-px bg-border overflow-hidden mt-2">
          <div className="h-full bg-primary animate-[loading_1.2s_ease-in-out_forwards]" />
        </div>
      </div>
    </div>
  );
}

export default memo(LoadingScreen);