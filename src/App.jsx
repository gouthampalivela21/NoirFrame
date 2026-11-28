import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CmsCanvasBridge from "./components/CmsCanvasBridge.jsx";
import { LiveCmsProvider } from "./context/LiveCmsContext.jsx";


// Public Pages
const Home = lazy(() => import("./pages/Home.jsx"));
const WebsiteExperiencePage = lazy(() => import("./pages/WebsiteExperiencePage.jsx"));
const EditorialFeaturePage = lazy(() => import("./pages/EditorialFeaturePage.jsx"));
const BookingPage = lazy(() => import("./pages/BookingPage.jsx"));
const StoriesPage = lazy(() => import("./pages/StoriesPage.jsx"));
const JourneysPage = lazy(() => import("./pages/JourneysPage.jsx"));
const StudioPage = lazy(() => import("./pages/StudioPage.jsx"));

// Admin Dashboard & Live CMS
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.jsx"));

function AppShell() {
  const location = useLocation();
  const isAdmin =
    location.pathname === "/gouthamspace" ||
    location.pathname.startsWith("/gouthamspace/");
  const isBooking = location.pathname.startsWith("/book") || location.pathname.startsWith("/contact");
  const isExperience = location.pathname.startsWith("/experiences") || isBooking;
  const isEditorial =
    location.pathname.startsWith("/explore") ||
    location.pathname.startsWith("/stories/portraits") ||
    location.pathname.startsWith("/stories") ||
    location.pathname.startsWith("/journeys") ||
    location.pathname.startsWith("/studio");

  const scrollToHashTarget = React.useCallback((targetId) => {
    if (!targetId) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const offset = targetId === "websites" ? 0 : -56;
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
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
      window.scrollTo(0, 0);
      return;
    }

    const targetId = location.hash ? location.hash.replace("#", "") : null;

    if (!targetId) {
      window.scrollTo(0, 0);
    } else {
      scrollToHashTarget(targetId);
    }
  }, [location.pathname, location.hash, isAdmin, scrollToHashTarget]);

  return (
    <>
      <CmsCanvasBridge />
      {!isAdmin && <Navbar />}

      <main
        style={{
          minHeight: isAdmin ? "100vh" : isExperience || isEditorial ? "100vh" : undefined,
          backgroundColor: isAdmin ? "#FAF8F5" : isExperience ? "#050505" : isEditorial ? "#f7ede0" : undefined,
        }}
      >
        <Routes location={location} key={isAdmin ? "admin-shell" : location.pathname}>
            {/* Admin Dashboard & Live CMS */}
            <Route
              path="/gouthamspace/*"
              element={
                <Suspense
                  fallback={
                    <div style={{ minHeight: "100vh", background: "#FAF8F5" }} />
                  }
                >
                  <AdminDashboard />
                </Suspense>
              }
            />
            {/* Public Website Routes */}
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="page-loader-placeholder" />}>
                  <Home />
                </Suspense>
              }
            />
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
            
            <Route
              path="/stories"
              element={
                <Suspense fallback={<div className="page-loader-placeholder" />}>
                  <StoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/journeys"
              element={
                <Suspense fallback={<div className="page-loader-placeholder" />}>
                  <JourneysPage />
                </Suspense>
              }
            />
            <Route
              path="/studio"
              element={
                <Suspense fallback={<div className="page-loader-placeholder" />}>
                  <StudioPage />
                </Suspense>
              }
            />

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

            {/* Fallback for all other routes redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <LiveCmsProvider>
      <AppShell />
    </LiveCmsProvider>
  );
}
