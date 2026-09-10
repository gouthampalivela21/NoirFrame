import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToId } from "../utils/helpers.js";
import { useData } from "../context/DataContext.jsx";
import Logo from "./Logo.jsx";

const PRIMARY_MENU_ITEMS = [
  { label: "WORK", to: "/portfolio", id: "work" },
  { label: "ABOUT", to: "/about", id: "about" },
  { label: "SERVICES", to: "/#services", id: "services" },
  { label: "CONTACT", to: "/contact", id: "contact" },
  { label: "ARCHIVE", to: "/portfolio", id: "archive" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Desktop Hover Mega Menu State
  const [activeMega, setActiveMega] = useState(null); // 'work' | 'about' | 'services' | 'contact' | 'archive' | null

  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const {
    siteSettings,
    portfolioItems = [],
    galleryStrip = [],
    customPages = [],
    aboutData,
    contactData,
  } = useData();

  const studioName = siteSettings?.studioName || "Noir Frame";
  const inquiryEmail = contactData?.inquiryEmail || "teamnoirframe@gmail.com";
  const studioLocation = contactData?.location || "India • Worldwide Commissions";

  // Clean Apple-Inspired Text-Only Mega Menu Configuration
  const megaMenuConfigs = useMemo(() => {
    return {
      work: {
        id: "work",
        label: "Work",
        columns: [
          {
            title: "EXPLORE STORIES",
            links: [
              { label: "All Selected Work", to: "/portfolio", desc: "Comprehensive photography archive" },
              { label: "Featured Stories", to: "/portfolio", desc: "Curated portfolio commissions" },
              { label: "Moments in Motion", to: "/#gallery", isGallery: true, desc: "Visual stories filmstrip" },
            ],
          },
          {
            title: "DISCIPLINES",
            links: [
              { label: "Weddings & Celebrations", to: "/portfolio", desc: "Destination vows & ceremonies" },
              { label: "Portraits & Intimate", to: "/portfolio", desc: "Medium format natural light portraits" },
              { label: "Fashion & Editorial", to: "/portfolio", desc: "Lookbooks & bespoke campaigns" },
            ],
          },
          {
            title: "PRODUCTION & CRAFT",
            links: [
              { label: "Available Light", to: "/about", desc: "Natural illumination & analog grain" },
              { label: "Medium Format", to: "/about", desc: "Archival depth & composition" },
              { label: "Worldwide Commissions", to: "/contact", desc: "Available across continents" },
            ],
          },
        ],
      },
      about: {
        id: "about",
        label: "About",
        columns: [
          {
            title: "THE STUDIO",
            links: [
              { label: "Our Story & Vision", to: "/about", desc: "Rooted in restraint & quiet grace" },
              { label: "The Philosophy", to: "/about", desc: "Frames that feel like memories" },
              { label: "Behind Noir Frame", to: "/about", desc: "12+ years of international craft" },
            ],
          },
          {
            title: "ETHOS & STANDARDS",
            links: [
              { label: "Slow Photography", to: "/about", desc: "Unhurried observation of trust" },
              { label: "Analog & Digital", to: "/about", desc: "Hybrid workflow for longevity" },
              { label: "Editorial Standards", to: "/about", desc: "Published across 18 countries" },
            ],
          },
          {
            title: "COMMISSIONS",
            links: [
              { label: "Studio Availability", to: "/contact", desc: "Curated annual commissions" },
              { label: "Studio Coordinates", to: "/contact", desc: studioLocation },
              { label: "Direct Inquiries", to: `mailto:${inquiryEmail}`, isExternal: true, desc: inquiryEmail },
            ],
          },
        ],
      },
      services: {
        id: "services",
        label: "Services",
        columns: [
          {
            title: "PHOTOGRAPHY",
            links: [
              { label: "Wedding Photography", to: "/#services", desc: "Full-day destination documentary" },
              { label: "Editorial & Portraiture", to: "/#services", desc: "Medium format studio & location" },
              { label: "Commercial & Brands", to: "/#services", desc: "Campaigns & architectural work" },
            ],
          },
          {
            title: "MOTION & CINEMA",
            links: [
              { label: "Cinematography", to: "/#services", desc: "4K cinematic films & soundscapes" },
              { label: "Visual Storytelling", to: "/#gallery", isGallery: true, desc: "Moments in Motion captures" },
              { label: "Creative Direction", to: "/#services", desc: "Bespoke concept & art direction" },
            ],
          },
          {
            title: "COMMISSION DETAILS",
            links: [
              { label: "Bespoke Production", to: "/contact", desc: "Tailored to the scale of each story" },
              { label: "Limited Availability", to: "/contact", desc: "Curated commissions accepted" },
              { label: "Inquire for Dates", to: "/contact", desc: "24–48 hour direct response" },
            ],
          },
        ],
      },
      contact: {
        id: "contact",
        label: "Contact",
        columns: [
          {
            title: "DIRECT INQUIRIES",
            links: [
              { label: "Commission Inquiries", to: "/contact", desc: "Tell us about your upcoming date" },
              { label: "Book a Session", to: "/contact", desc: "Editorial and portrait bookings" },
              { label: "General Inquiries", to: "/contact", desc: "Services and destination travel" },
            ],
          },
          {
            title: "STUDIO DETAILS",
            links: [
              { label: "Studio Location", to: "/contact", desc: studioLocation },
              { label: "Direct Email", to: `mailto:${inquiryEmail}`, isExternal: true, desc: inquiryEmail },
              { label: "Response Time", to: "/contact", desc: "Within 24–48 business hours" },
            ],
          },
          {
            title: "CONNECT",
            links: [
              { label: "Instagram", to: "https://instagram.com", isExternal: true, desc: "@noirframe official" },
              { label: "Behance", to: "https://behance.net", isExternal: true, desc: "Archival design features" },
              { label: "Client Archive", to: "/portfolio", desc: "Private delivery & galleries" },
            ],
          },
        ],
      },
      archive: {
        id: "archive",
        label: "Archive",
        columns: [
          {
            title: "RETROSPECTIVES",
            links: [
              { label: "Complete Archival Catalog", to: "/portfolio", desc: "Every visual story documented" },
              { label: "2026 Collection", to: "/portfolio", desc: "Current year commissions" },
              { label: "2025 Retrospective", to: "/portfolio", desc: "Archival ceremonies & features" },
            ],
          },
          {
            title: "CATEGORY ARCHIVES",
            links: [
              { label: "Weddings Archive", to: "/portfolio", desc: "Intimate & destination ceremonies" },
              { label: "Portraits Archive", to: "/portfolio", desc: "Medium format editorial sessions" },
              { label: "Visual Stories Filmstrip", to: "/#gallery", isGallery: true, desc: "Moments in Motion cinema" },
            ],
          },
          {
            title: "STUDIO ARCHIVE",
            links: [
              { label: "Archival Longevity", to: "/about", desc: "Crafted for emotional value" },
              { label: "Curation Standards", to: "/about", desc: "Unhurried editing & composition" },
            ],
          },
        ],
      },
    };
  }, [inquiryEmail, studioLocation]);

  // Combine primary menu items with custom pages marked for navigation
  const allMenuItems = useMemo(() => {
    const customItems = (customPages || [])
      .filter((p) => p.showInNav !== false)
      .map((p) => ({
        label: (p.title || "").toUpperCase(),
        to: `/page/${p.slug}`,
        id: `page-${p.slug}`,
      }));
    return [...PRIMARY_MENU_ITEMS, ...customItems];
  }, [customPages]);

  // Desktop navigation links (kept intact)
  const desktopLinks = useMemo(() => {
    return [
      { label: "Work", to: "/portfolio", id: "work" },
      { label: "About", to: "/about", id: "about" },
      { label: "Services", to: "/#services", id: "services" },
      { label: "Contact", to: "/contact", id: "contact" },
      { label: "Archive", to: "/portfolio", id: "archive" },
      ...(customPages || [])
        .filter((p) => p.showInNav !== false)
        .map((p) => ({
          label: p.title,
          to: `/page/${p.slug}`,
          id: `page-${p.slug}`,
        })),
    ];
  }, [customPages]);

  // Search Results filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedPortfolio = portfolioItems
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.client?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
      .map((item) => ({
        id: `portfolio-${item.id}`,
        title: item.title,
        category: item.category || "Selected Work",
        to: `/project/${item.id}`,
      }));

    const matchedGallery = galleryStrip
      .filter(
        (item) =>
          item.caption?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.tagline?.toLowerCase().includes(q)
      )
      .map((item) => ({
        id: `gallery-${item.id}`,
        title: item.caption,
        category: item.category || "Visual Story",
        to: `/#gallery`,
        isGallery: true,
      }));

    return [...matchedPortfolio, ...matchedGallery].slice(0, 6);
  }, [searchQuery, portfolioItems, galleryStrip]);

  // Scroll listener
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setActiveMega(null);
    setSearchQuery("");
    document.body.style.overflow = "";
  }, [location.pathname, location.search, location.hash]);

  // Lock body scroll when mobile menu or search is open
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setActiveMega(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, searchOpen]);

  // Auto focus search input when search is opened
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setActiveMega(null);
    setSearchQuery("");
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  // Desktop Mega Menu Hover Handlers with Intentional Delay
  const handleNavMouseEnter = (megaKey) => {
    if (window.innerWidth <= 768 || !megaMenuConfigs[megaKey]) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (activeMega) {
      // Already open: switch tab immediately with zero flicker
      setActiveMega(megaKey);
    } else {
      // Opening initially: intentional 120ms debounce
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = setTimeout(() => {
        setActiveMega(megaKey);
      }, 120);
    }
  };

  const handleNavMouseLeave = () => {
    if (window.innerWidth <= 768) return;

    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveMega(null);
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveMega(null);
    }, 180);
  };

  const handleLinkClick = (e, item) => {
    closeAll();
    if ((item.id === "services" || item.to === "/#services") && location.pathname === "/") {
      e.preventDefault();
      scrollToId("services");
    } else if ((item.isGallery || item.to === "/#gallery") && location.pathname === "/") {
      e.preventDefault();
      scrollToId("gallery");
    }
  };

  const handleSearchResultClick = (result) => {
    closeAll();
    if (result.isGallery && location.pathname === "/") {
      scrollToId("gallery");
    } else {
      navigate(result.to);
    }
  };

  const currentMega = activeMega ? megaMenuConfigs[activeMega] : null;

  return (
    <>
      <header
        ref={navRef}
        className={`glass-nav navbar ${scrolled ? "is-scrolled" : ""} ${
          menuOpen ? "is-menu-open" : ""
        } ${activeMega ? "is-mega-open" : ""}`}
      >
        <div className="navbar__inner container-max">
          {/* Brand Logo: Desktop 18px / Mobile 32px */}
          <Link
            to="/"
            className="navbar__brand"
            data-cursor="button"
            aria-label="Noir Frame"
            onClick={closeAll}
          >
            {/* Desktop micro logo */}
            <span className="navbar__logo-desktop">
              <Logo size={16} />
            </span>
            {/* Mobile 26px standalone logo */}
            <span className="navbar__logo-mobile">
              <Logo size={26} />
            </span>
          </Link>

          {/* Desktop Centered Navigation Links with Apple-Style Mega Menu */}
          <nav
            className="nav-links"
            aria-label="Main Navigation"
            onMouseLeave={handleNavMouseLeave}
          >
            {desktopLinks.map((link) => {
              const megaKey = link.id === "portfolio" ? "work" : link.id;
              const hasMega = Boolean(megaMenuConfigs[megaKey]);
              const isActiveMega = activeMega === megaKey;

              return (
                <div
                  key={link.label}
                  className="nav-links__item-wrap"
                  onMouseEnter={() => hasMega && handleNavMouseEnter(megaKey)}
                >
                  <Link
                    to={link.to}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={`nav-links__item label-sm ${
                      isActiveMega ? "is-active-mega" : ""
                    }`}
                    data-cursor="button"
                    aria-expanded={isActiveMega}
                  >
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mobile Action Icons: [ SEARCH ] [ ARCHIVE ] [ MENU ] */}
          <div className="navbar__mobile-actions" aria-label="Mobile Navigation Actions">
            {/* 1. Search Icon Button */}
            <button
              type="button"
              className={`navbar__mobile-btn ${searchOpen ? "is-active" : ""}`}
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((prev) => !prev);
              }}
              aria-label="Search visual stories and archive"
              data-cursor="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>

            {/* 2. Archive / Portfolio Icon Button */}
            <Link
              to="/portfolio"
              className="navbar__mobile-btn"
              onClick={closeAll}
              aria-label="View Archive and Portfolio"
              data-cursor="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10" />
                <path d="M7 12h10" />
                <path d="M7 16h6" />
              </svg>
            </Link>

            {/* 3. Hamburger Menu Button (Transforms into X) */}
            <button
              type="button"
              className={`navbar__mobile-btn navbar__menu-toggle ${
                menuOpen ? "is-open" : ""
              }`}
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((prev) => !prev);
              }}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              data-cursor="button"
            >
              <span className="navbar__menu-icon">
                <span className="navbar__menu-bar navbar__menu-bar--top" />
                <span className="navbar__menu-bar navbar__menu-bar--bot" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Apple-Inspired Ambient Scrim */}
      <AnimatePresence>
        {activeMega && (
          <motion.div
            className="navbar-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={closeAll}
          />
        )}
      </AnimatePresence>

      {/* Desktop Apple-Inspired Full-Width Text-Only Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMega && currentMega && (
          <motion.div
            className="navbar-mega-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.995 }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <div className="navbar-mega-inner container-max">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMega}
                  className="navbar-mega-columns"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {currentMega.columns.map((col, colIdx) => (
                    <motion.div
                      key={col.title || colIdx}
                      className="navbar-mega-col"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: 0.02 + colIdx * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <span className="navbar-mega-col-title label-xs">
                        {col.title}
                      </span>
                      <ul className="navbar-mega-links">
                        {col.links.map((item, itemIdx) => (
                          <motion.li
                            key={item.label}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.24,
                              delay: 0.03 + colIdx * 0.04 + itemIdx * 0.025,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            {item.isExternal ? (
                              <a
                                href={item.to}
                                target="_blank"
                                rel="noreferrer"
                                className="navbar-mega-link"
                                onClick={closeAll}
                              >
                                <span className="navbar-mega-link-title">
                                  {item.label}
                                </span>
                                {item.desc && (
                                  <span className="navbar-mega-link-desc label-xs">
                                    {item.desc}
                                  </span>
                                )}
                              </a>
                            ) : (
                              <Link
                                to={item.to}
                                className="navbar-mega-link"
                                onClick={(e) => handleLinkClick(e, item)}
                              >
                                <span className="navbar-mega-link-title">
                                  {item.label}
                                </span>
                                {item.desc && (
                                  <span className="navbar-mega-link-desc label-xs">
                                    {item.desc}
                                  </span>
                                )}
                              </Link>
                            )}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay / Drawer */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="mobile-search-overlay"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-search-inner container-max">
              <div className="mobile-search-bar">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mobile-search-bar__icon"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="mobile-search-bar__input"
                  placeholder="Search visual stories, portfolios, archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="mobile-search-bar__clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length > 0 && (
                <div className="mobile-search-results">
                  {searchResults.length > 0 ? (
                    <ul className="mobile-search-list">
                      {searchResults.map((res) => (
                        <li key={res.id}>
                          <button
                            type="button"
                            className="mobile-search-item"
                            onClick={() => handleSearchResultClick(res)}
                          >
                            <span className="mobile-search-item__title">{res.title}</span>
                            <span className="mobile-search-item__cat label-xs">
                              {res.category} &rarr;
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mobile-search-empty">
                      <p>No archives or stories matching &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple-Inspired Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mobile-menu-inner container-max">
              {/* Primary Vertically Stacked Links */}
              <nav className="mobile-menu-nav" aria-label="Mobile Menu Navigation">
                {allMenuItems.map((item, index) => (
                  <motion.div
                    key={item.id || item.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      duration: 0.38,
                      delay: 0.05 + index * 0.045,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      to={item.to}
                      className="mobile-menu-link"
                      onClick={(e) => handleLinkClick(e, item)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Secondary Editorial Studio Footer inside Menu */}
              <motion.div
                className="mobile-menu-footer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{
                  duration: 0.42,
                  delay: 0.05 + allMenuItems.length * 0.045 + 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="mobile-menu-footer__divider" />
                
                <div className="mobile-menu-footer__content">
                  <div className="mobile-menu-footer__inquiry">
                    <span className="label-xs">Direct Commissions</span>
                    <a href={`mailto:${inquiryEmail}`} className="body-sm font-serif-italic">
                      {inquiryEmail}
                    </a>
                  </div>

                  <div className="mobile-menu-footer__links">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="label-xs"
                    >
                      Instagram &rarr;
                    </a>
                    <a
                      href="https://behance.net"
                      target="_blank"
                      rel="noreferrer"
                      className="label-xs"
                    >
                      Behance &rarr;
                    </a>
                  </div>
                </div>

                <div className="mobile-menu-footer__copy label-xs">
                  &copy; {new Date().getFullYear()} {studioName} &mdash; All Rights Reserved
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
