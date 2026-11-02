import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminUpcomingShoots() {
  const { bookings } = useAdmin();
  const [selectedDay, setSelectedDay] = useState(31);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-indexed: 9 = Oct

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Days row matching the reference screenshot: 26, 27, 28, 29, 30, 31, 1
  const daysRow = [
    { day: 26, isOtherMonth: true },
    { day: 27, isOtherMonth: false },
    { day: 28, isOtherMonth: false },
    { day: 29, isOtherMonth: false },
    { day: 30, isOtherMonth: false },
    { day: 31, isOtherMonth: false, hasShoot: true },
    { day: 1, isOtherMonth: true, hasShoot: true },
  ];

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  };

  // Fallback default shoots from screenshot if empty
  const displayShoots = bookings.length > 0 ? bookings.slice(0, 3) : [
    {
      id: "shoot-1",
      title: "Pre-Wedding Shoot",
      client: "Aditi & Rohan",
      location: "Gokarna",
      dateFormatted: "Nov 02, 2025 · 6:00 AM",
      thumbnail: "/images/dashboard/shoot-1.png",
    },
    {
      id: "shoot-2",
      title: "Wedding Coverage",
      client: "Priya & Karthik",
      location: "Bangalore",
      dateFormatted: "Nov 09, 2025 · 8:00 AM",
      thumbnail: "/images/dashboard/shoot-2.png",
    },
    {
      id: "shoot-3",
      title: "Brand Shoot",
      client: "The Grove Café",
      location: "Bangalore",
      dateFormatted: "Nov 12, 2025 · 9:00 AM",
      thumbnail: "/images/dashboard/shoot-3.png",
    },
  ];

  return (
    <div className="admin-section-block">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Upcoming Shoots</h2>
        <Link to="/admin/bookings" className="admin-calendar-link">
          <span>View Calendar</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Mini Calendar Widget */}
      <div className="admin-mini-calendar">
        <div className="admin-calendar-header">
          <span className="admin-calendar-month">
            {monthNames[currentMonthIndex]} 2025
          </span>
          <div className="admin-calendar-arrows">
            <button
              type="button"
              className="admin-cal-arrow-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              &lt;
            </button>
            <button
              type="button"
              className="admin-cal-arrow-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="admin-calendar-grid-header">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Calendar days row matching screenshot */}
        <div className="admin-calendar-days-row">
          {daysRow.map((cell, idx) => {
            const isSelected = selectedDay === cell.day;
            return (
              <div
                key={idx}
                className={`admin-cal-day-cell ${isSelected ? "is-selected" : ""} ${cell.hasShoot ? "has-shoot" : ""}`}
                style={{
                  opacity: cell.isOtherMonth && !isSelected ? 0.45 : 1,
                }}
                onClick={() => setSelectedDay(cell.day)}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Shoots List */}
      <div className="admin-shoots-list">
        {displayShoots.map((shoot) => (
          <div key={shoot.id} className="admin-shoot-card">
            <img
              src={shoot.thumbnail || "/images/dashboard/shoot-1.png"}
              alt={shoot.title}
              className="admin-shoot-thumb"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/images/dashboard/shoot-1.png";
              }}
            />
            <div className="admin-shoot-info">
              <h3 className="admin-shoot-title">{shoot.title}</h3>
              <span className="admin-shoot-client">
                {shoot.client} &middot; {shoot.location}
              </span>
              <span className="admin-shoot-time">
                {shoot.dateFormatted || `${shoot.date} · ${shoot.time}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

