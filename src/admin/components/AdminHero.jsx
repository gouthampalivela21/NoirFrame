import React from "react";
import { IconCalendar, IconPlus } from "./AdminIcons.jsx";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminHero() {
  const { user } = useAdmin();

  // Format greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Format current date matching "Fri, Oct 31, 2025" style
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const handleNewProject = () => {
    window.dispatchEvent(new CustomEvent("admin:new-project"));
  };

  return (
    <section className="admin-hero">
      <div className="admin-hero__left">
        <span className="admin-hero__eyebrow">Studio Dashboard</span>
        <h1 className="admin-hero__title">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}.
        </h1>
        <p className="admin-hero__subtitle">
          Here&apos;s what&apos;s happening at Phantom Labs.
        </p>
      </div>

      <div className="admin-hero__right">
        {/* Mountain panorama image with horizontal fade mask */}
        <div className="admin-hero__mountain-wrap">
          <img
            src="/images/dashboard-mountains.png"
            alt="Phantom Labs Landscape"
            className="admin-hero__mountain-img"
          />
        </div>

        {/* Action Controls: Live Date Indicator + "+ New Project" Button */}
        <div className="admin-hero__controls">
          <div className="admin-date-badge">
            <IconCalendar className="admin-date-icon" size={15} />
            <span>{formattedDate}</span>
          </div>

          <button
            type="button"
            className="admin-btn-black"
            onClick={handleNewProject}
          >
            <IconPlus size={13} />
            <span>New Project</span>
          </button>
        </div>
      </div>
    </section>
  );
}

