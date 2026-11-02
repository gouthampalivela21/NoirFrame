import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AdminProvider } from "./admin/context/AdminContext.jsx";
import AdminProtectedRoute from "./admin/components/AdminProtectedRoute.jsx";

import { prefersReducedMotion, isTouchDevice } from "./utils/helpers.js";

// Public Pages
const Home = lazy(() => import("./pages/Home.jsx"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage.jsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage.jsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CustomPageView = lazy(() => import("./pages/CustomPageView.jsx"));
const TeamPage = lazy(() => import("./pages/TeamPage.jsx"));
const TeamDetailPage = lazy(() => import("./pages/TeamDetailPage.jsx"));

// Admin Dashboard Pages
const AdminLoginPage = lazy(() => import("./admin/pages/AdminLoginPage.jsx"));
const AdminLayout = lazy(() => import("./admin/components/AdminLayout.jsx"));
const AdminDashboardPage = lazy(() => import("./admin/pages/AdminDashboardPage.jsx"));
const AdminInquiriesPage = lazy(() => import("./admin/pages/AdminInquiriesPage.jsx"));
const AdminClientsPage = lazy(() => import("./admin/pages/AdminClientsPage.jsx"));
const AdminProjectsPage = lazy(() => import("./admin/pages/AdminProjectsPage.jsx"));
const AdminBookingsPage = lazy(() => import("./admin/pages/AdminBookingsPage.jsx"));
const AdminPortfolioPage = lazy(() => import("./admin/pages/AdminPortfolioPage.jsx"));
const AdminServicesPage = lazy(() => import("./admin/pages/AdminServicesPage.jsx"));
const AdminTestimonialsPage = lazy(() => import("./admin/pages/AdminTestimonialsPage.jsx"));
const AdminMessagesPage = lazy(() => import("./admin/pages/AdminMessagesPage.jsx"));
const AdminAnalyticsPage = lazy(() => import("./admin/pages/AdminAnalyticsPage.jsx"));
const AdminSettingsPage = lazy(() => import("./admin/pages/AdminSettingsPage.jsx"));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Disable smooth Lenis scrolling on admin dashboard for instant, native responsiveness
    if (isAdmin || prefersReducedMotion()) return undefined;

    const isTouch = isTouchDevice();
    if (isTouch) {
      const onNativeScroll = () => {
        ScrollTrigger.update();
      };
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", onNativeScroll);
    }

    const lenis = new Lenis({
      duration: 0.85,
      smoothWheel: true,
      wheelMultiplier: 0.98,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [isAdmin]);

  // Coordinated scroll position restoration across route transitions
  useEffect(() => {
    if (isAdmin) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = location.hash ? location.hash.replace("#", "") : null;

    if (!targetId) {
      window.scrollTo(0, 0);
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
    }

    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el && window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        } else if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    });

    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash, isAdmin]);

  return (
    <AdminProvider>
      {/* Public Navbar hidden on all admin dashboard routes */}
      {!isAdmin && <Navbar />}

      <main style={{ minHeight: isAdmin ? "100vh" : undefined }}>
        <Suspense fallback={<div className="page-loader-placeholder" />}>
          <Routes location={location}>
            {/* Public Website Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<PortfolioPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/team/:slug" element={<TeamDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/page/:slug" element={<CustomPageView />} />

            {/* Admin Authentication Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Shell & Nested Modules */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="inquiries" element={<AdminInquiriesPage />} />
              <Route path="clients" element={<AdminClientsPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="portfolio" element={<AdminPortfolioPage />} />
              <Route
                path="services"
                element={
                  <AdminProtectedRoute requiredRole="Co-Founder">
                    <AdminServicesPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="testimonials"
                element={
                  <AdminProtectedRoute requiredRole="Co-Founder">
                    <AdminTestimonialsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route
                path="analytics"
                element={
                  <AdminProtectedRoute requiredRole="Co-Founder">
                    <AdminAnalyticsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <AdminProtectedRoute requiredRole="Founder">
                    <AdminSettingsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route path="*" element={<AdminDashboardPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      {/* Public Footer hidden on all admin dashboard routes */}
      {!isAdmin && <Footer />}
    </AdminProvider>
  );
}
