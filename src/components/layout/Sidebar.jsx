import { NavLink } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";

const adminLinks = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "⌂" },
  { label: "Opportunities", path: "/admin/opportunities", icon: "▣" },
  { label: "Add opportunity", path: "/admin/opportunities/new", icon: "+" },
  { label: "Events", path: "/admin/events", icon: "◇" },
  { label: "Applications", path: "/admin/applications", icon: "✓" },
  { label: "Announcements", path: "/admin/announcements", icon: "◉" },
];

const studentLinks = [
  { label: "Dashboard", path: "/student/dashboard", icon: "⌂" },
  { label: "Opportunities", path: "/student/opportunities", icon: "▣" },
  { label: "Application Tracker", path: "/student/tracker", icon: "✓" },
  { label: "Upcoming Events", path: "/student/events", icon: "◇" },
  { label: "Bookmarks", path: "/student/bookmarks", icon: "★" },
  { label: "Announcements", path: "/student/announcements", icon: "◉" },
  { label: "Profile", path: "/student/profile", icon: "○" },
];

function Sidebar({ role, mobileOpen, onClose }) {
  const { unreadAnnouncementCount } = useCampus();
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {mobileOpen && <button className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="brand">
          <span className="brand__mark">CC</span>
          <div>
            <strong>CampusConnect</strong>
            <small>Placement portal</small>
          </div>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__label">Workspace</p>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__icon">{link.icon}</span>
              <span className="sidebar__link-label">{link.label}</span>
              {role === "student" &&
                link.path === "/student/announcements" &&
                unreadAnnouncementCount > 0 && (
                  <span className="sidebar__unread-badge">
                    {unreadAnnouncementCount}
                  </span>
                )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p>Version 1</p>
          <span>Placement management</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
