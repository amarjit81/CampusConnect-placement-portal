import { useLocation, useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import RoleBadge from "./RoleBadge";

const pageNames = {
  dashboard: "Dashboard",
  opportunities: "Opportunities",
  tracker: "Application Tracker",
  events: "Upcoming Events",
  new: "Add opportunity",
  bookmarks: "Bookmarks",
  announcements: "Announcements",
  profile: "Profile",
  applications: "Applications",
};

function Topbar({ onMenuClick }) {
  const { currentRole, logout, student } = useCampus();
  const navigate = useNavigate();
  const location = useLocation();
  const lastSegment = location.pathname.split("/").filter(Boolean).at(-1);
  const pageTitle =
    lastSegment === "events" && currentRole === "admin"
      ? "Events"
      : location.pathname.endsWith("/edit")
        ? "Edit opportunity"
        : pageNames[lastSegment] || "Opportunity details";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="topbar__title">
        <button className="menu-button" onClick={onMenuClick}>
          ☰
        </button>
        <div>
          <small>CampusConnect</small>
          <h1>{pageTitle}</h1>
        </div>
      </div>

      <div className="topbar__actions">
        <div className="topbar__user">
          <span className="avatar">
            {currentRole === "admin" ? "TP" : student.name.charAt(0)}
          </span>
          <div>
            <strong>
              {currentRole === "admin" ? "T&P Admin" : student.name}
            </strong>
            <RoleBadge role={currentRole} />
          </div>
        </div>
        <button className="button button--ghost button--small" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Topbar;
