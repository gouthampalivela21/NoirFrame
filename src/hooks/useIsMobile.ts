import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

let cachedIsMobile: boolean | undefined;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (cachedIsMobile !== undefined) return cachedIsMobile;
    return typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      cachedIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(cachedIsMobile);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
