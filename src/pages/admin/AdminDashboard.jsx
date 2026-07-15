import { Link } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import StatCard from "../../components/common/StatCard";
import OpportunityList from "../../components/opportunities/OpportunityList";
import AnnouncementList from "../../components/announcements/AnnouncementList";

function AdminDashboard() {
  const { opportunities, announcements } = useCampus();
  const activeCount = opportunities.filter(
    (opportunity) => opportunity.status === "active",
  ).length;

  return (
    <div className="page-stack">
      <div className="page-header page-header--welcome">
        <div>
          <p className="eyebrow">T&P workspace</p>
          <h2>Placement overview</h2>
          <p>Manage the information students need for the current cycle.</p>
        </div>
        <Link className="button button--primary" to="/admin/opportunities/new">
          + Add opportunity
        </Link>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Total opportunities"
          value={opportunities.length}
          helper="Across all statuses"
          tone="blue"
        />
        <StatCard
          label="Active opportunities"
          value={activeCount}
          helper="Accepting applications"
          tone="green"
        />
        <StatCard
          label="Announcements"
          value={announcements.length}
          helper="Published updates"
          tone="orange"
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recently posted</p>
            <h2>Latest opportunities</h2>
          </div>
          <Link className="text-link" to="/admin/opportunities">
            View all →
          </Link>
        </div>
        <OpportunityList opportunities={opportunities.slice(0, 3)} />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest communication</p>
            <h2>Recent announcements</h2>
          </div>
          <Link className="text-link" to="/admin/announcements">
            Manage →
          </Link>
        </div>
        <AnnouncementList announcements={announcements.slice(0, 2)} />
      </section>
    </div>
  );
}

export default AdminDashboard;
