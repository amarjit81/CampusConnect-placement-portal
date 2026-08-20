import { useMemo, useState } from "react";
import { useCampus } from "../../context/CampusContext";

function AdminApplicationsPage() {
  const { adminApplications } = useCampus();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const applications = useMemo(
    () =>
      adminApplications.filter((application) => {
        const matchesStatus = status === "all" || application.status === status;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          [
            application.studentName,
            application.studentEmail,
            application.company,
            application.role,
          ].some((value) => String(value || "").toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
      }),
    [adminApplications, search, status],
  );

  return (
    <div className="page-stack">
      <div className="page-header"><div><p className="eyebrow">Placement pipeline</p><h2>Student applications</h2><p>Review applications and current selection stages across opportunities.</p></div></div>
      <div className="filter-bar">
        <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, company, or role" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option><option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option><option value="in-progress">In progress</option>
          <option value="selected">Selected</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option>
        </select>
        <span className="result-count">{applications.length} application{applications.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="tracker-list">
        {applications.map((application) => (
          <article className="tracker-card" key={application.id}>
            <div className="tracker-card__header">
              <div><p>{application.studentName || "Student"}</p><h3>{application.company} — {application.role}</h3><small>{application.studentEmail} · Applied {new Date(`${application.appliedDate}T00:00:00`).toLocaleDateString("en-IN")}</small></div>
              <strong className={`application-status application-status--${application.status}`}>{application.applicationStatus}</strong>
            </div>
            <div className="tracker-card__progress">
              <div className="tracker-card__field"><span>Current round</span><strong>{application.currentRound}</strong></div>
              <div className="tracker-card__field"><span>Next step</span><strong>{application.nextStep || "Not specified"}</strong></div>
              <div className="tracker-card__field"><span>Notes</span><strong>{application.notes || "No notes"}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminApplicationsPage;
