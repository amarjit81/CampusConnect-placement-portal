import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout() {
  const { currentRole } = useCampus();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        role={currentRole}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="app-shell__main">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
