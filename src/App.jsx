import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
const WebsiteExperiencePage = lazy(() => import("./pages/WebsiteExperiencePage.jsx"));
const EditorialFeaturePage = lazy(() => import("./pages/EditorialFeaturePage.jsx"));
const PortraitExplorePage = lazy(() => import("./pages/PortraitExplorePage.jsx"));
const BookingPage = lazy(() => import("./pages/BookingPage.jsx"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage.jsx"));

// Admin Dashboard Pages
const AdminLoginPage = lazy(() => import("./admin/pages/AdminLoginPage.jsx"));
const AdminInviteAcceptPage = lazy(() => import("./admin/pages/AdminInviteAcceptPage.jsx"));
import AdminLayout from "./admin/components/AdminLayout.jsx";
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
const AdminTeamPage = lazy(() => import("./admin/pages/AdminTeamPage.jsx"));
const AdminSettingsPage = lazy(() => import("./admin/pages/AdminSettingsPage.jsx"));

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isBooking = location.pathname.startsWith("/book") || location.pathname.startsWith("/contact");
  const isExperience = location.pathname.startsWith("/experiences") || isBooking;
  const isEditorial = location.pathname.startsWith("/explore") || location.pathname.startsWith("/stories/portraits");

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
      allowNestedScroll: true,
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

  const scrollToHashTarget = React.useCallback((targetId) => {
    if (!targetId) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const offset = targetId === "websites" ? 0 : -56;
        if (window.__lenis) {
          window.__lenis.scrollTo(el, { offset, duration: 1.05 });
        } else {
          const top = el.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
        return;
      }
      if (attempts < 15) {
        attempts += 1;
        requestAnimationFrame(tryScroll);
      }
    };
    requestAnimationFrame(tryScroll);
  }, []);

  // Coordinated scroll position restoration across route transitions
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (isAdmin) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    const targetId = location.hash ? location.hash.replace("#", "") : null;

    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      }
    } else {
      scrollToHashTarget(targetId);
    }

    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash, isAdmin, scrollToHashTarget]);

  const handleRouteExitComplete = () => {
    if (isAdmin) return;
    const targetId = location.hash ? location.hash.replace("#", "") : null;
    if (targetId) {
      scrollToHashTarget(targetId);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  return (
    <AdminProvider>
      {/* Public Navbar hidden on all admin dashboard routes */}
      {!isAdmin && <Navbar />}

      <main
        style={{
          minHeight: isAdmin || isExperience || isEditorial ? "100vh" : undefined,
          backgroundColor: isExperience ? "#050505" : isEditorial ? "#f7ede0" : undefined,
        }}
      >
        <AnimatePresence mode="wait" onExitComplete={handleRouteExitComplete}>
          <Routes location={location} key={isAdmin ? "admin-shell" : location.pathname}>
            {/* Public Website Routes */}
            <Route path="/" element={<Suspense fallback={<div className="page-loader-placeholder" />}><Home /></Suspense>} />
            <Route
              path="/experiences/website-design"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#050505" }}
                    />
                  }
                >
                  <WebsiteExperiencePage />
                </Suspense>
              }
            />
            <Route
              path="/explore/portraits"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#f7ede0" }}
                    />
                  }
                >
                  <EditorialFeaturePage categoryOverride="portraits" />
                </Suspense>
              }
            />
            <Route
              path="/explore/:category"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#f7ede0" }}
                    />
                  }
                >
                  <EditorialFeaturePage />
                </Suspense>
              }
            />
            <Route path="/stories/portraits" element={<Navigate to="/explore/portraits" replace />} />
            <Route path="/stories" element={<Suspense fallback={<div className="page-loader-placeholder" />}><PlaceholderPage title="Stories" /></Suspense>} />
            <Route path="/journeys" element={<Suspense fallback={<div className="page-loader-placeholder" />}><PlaceholderPage title="Journeys" /></Suspense>} />
            <Route path="/studio" element={<Suspense fallback={<div className="page-loader-placeholder" />}><PlaceholderPage title="The Studio" /></Suspense>} />

            {/* Booking & Creative Brief Routes */}
            <Route
              path="/book/:category?"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#050505" }}
                    />
                  }
                >
                  <BookingPage />
                </Suspense>
              }
            />
            <Route
              path="/book"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#050505" }}
                    />
                  }
                >
                  <BookingPage />
                </Suspense>
              }
            />
            <Route
              path="/contact"
              element={
                <Suspense
                  fallback={
                    <div
                      className="page-loader-placeholder"
                      style={{ minHeight: "100vh", background: "#050505" }}
                    />
                  }
                >
                  <BookingPage />
                </Suspense>
              }
            />

            {/* Preserve Homepage CTA Destinations Cleanly */}
            <Route path="/work" element={<Navigate to="/stories" replace />} />
            <Route path="/services" element={<Navigate to="/journeys" replace />} />

            {/* Admin Authentication & Invitation Routes */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0A" }} />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/invite/:token"
              element={
                <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0A" }} />}>
                  <AdminInviteAcceptPage />
                </Suspense>
              }
            />

            {/* Protected Admin Shell & Nested Modules (Persistent, Zero-Blink Shell) */}
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
                  <AdminProtectedRoute requiredRole="Founder">
                    <AdminServicesPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="testimonials"
                element={
                  <AdminProtectedRoute requiredRole="Admin">
                    <AdminTestimonialsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route
                path="analytics"
                element={
                  <AdminProtectedRoute requiredRole="Admin">
                    <AdminAnalyticsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="team"
                element={
                  <AdminProtectedRoute requiredRole="Founder">
                    <AdminTeamPage />
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

            {/* Fallback for retired secondary routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Public Footer hidden on all admin dashboard routes */}
      {!isAdmin && <Footer />}
    </AdminProvider>
  );
}
