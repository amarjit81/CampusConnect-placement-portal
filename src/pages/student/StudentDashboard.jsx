import { Link } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import StatCard from "../../components/common/StatCard";
import AnnouncementList from "../../components/announcements/AnnouncementList";
import {
  isApplied,
  isEligible,
  isNotApplied,
} from "../../utils/opportunityStatus";
import { sortAnnouncementsNewest } from "../../utils/announcements";

function StudentDashboard() {
  const { opportunities, announcements, student } = useCampus();
  const eligibleOpportunities = opportunities.filter(isEligible);
  const appliedOpportunities = opportunities.filter(isApplied);
  const notAppliedOpportunities = opportunities.filter(isNotApplied);
  const recentAnnouncements = sortAnnouncementsNewest(announcements).slice(0, 3);

  return (
    <div className="page-stack student-dashboard">
      <section className="student-welcome">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h2>Good morning, {student.name.split(" ")[0]}.</h2>
          <p>
            Track eligible roles, applications, and upcoming placement tasks.
          </p>
        </div>
        <div className="student-profile-chip">
          <span>{student.branch}</span>
          <span>CGPA {student.cgpa}</span>
          <span>Class of {student.graduationYear}</span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Eligible Opportunities"
          value={eligibleOpportunities.length}
          helper="Roles matched to your profile and eligibility."
          tone="green"
          actionLabel="View Eligible"
          to="/student/opportunities?filter=eligible"
        />
        <StatCard
          label="Applied"
          value={appliedOpportunities.length}
          helper="Opportunities you have already applied to."
          tone="blue"
          actionLabel="View Applied"
          to="/student/tracker"
        />
        <StatCard
          label="Not Applied"
          value={notAppliedOpportunities.length}
          helper="Eligible roles ready for your next action."
          tone="orange"
          actionLabel="View Not Applied"
          to="/student/opportunities?filter=not-applied"
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Official T&P updates</p>
            <h2>Recent announcements</h2>
          </div>
        </div>
        <AnnouncementList announcements={recentAnnouncements} />
        <div className="dashboard-section__footer">
          <Link className="text-link" to="/student/announcements">
            <span>View all announcements</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
