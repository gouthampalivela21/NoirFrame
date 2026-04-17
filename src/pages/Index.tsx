import { useState, useCallback, lazy, Suspense } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';

// Lazy load below-fold sections
const TrustStrip = lazy(() => import('@/components/TrustStrip'));
const AboutSection = lazy(() => import('@/components/AboutSection'));
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const WhyChooseUsSection = lazy(() => import('@/components/WhyChooseUsSection'));
const PortfolioSection = lazy(() => import('@/components/PortfolioSection'));
const WowSection = lazy(() => import('@/components/WowSection'));
const ResultsSection = lazy(() => import('@/components/ResultsSection'));
const ProcessSection = lazy(() => import('@/components/ProcessSection'));
const ReviewSection = lazy(() => import('@/components/ReviewSection'));
const ContactSection = lazy(() => import('@/components/ContactSection'));
const FooterSection = lazy(() => import('@/components/FooterSection'));

export default function Index() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <TrustStrip />
        <AboutSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <PortfolioSection />
        <WowSection />
        <ResultsSection />
        <ProcessSection />
        <ReviewSection />
        <ContactSection />
        <FooterSection />
      </Suspense>
    </div>
  );
}
