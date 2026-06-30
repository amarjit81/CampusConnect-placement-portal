import { Link, useParams } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import { checkEligibility } from "../../utils/eligibility";
import EligibilityBadge from "../../components/opportunities/EligibilityBadge";
import BookmarkButton from "../../components/opportunities/BookmarkButton";
import StatusBadge from "../../components/common/StatusBadge";
import NotFoundPage from "./NotFoundPage";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function OpportunityDetailsPage() {
  const { id } = useParams();
  const { opportunities, currentRole, student } = useCampus();
  const opportunity = opportunities.find((item) => item.id === id);

  if (!opportunity) {
    return <NotFoundPage embedded />;
  }

  const eligibility = checkEligibility(student, opportunity);

  return (
    <div className="page-stack">
      <Link className="back-link" to={`/${currentRole}/opportunities`}>
        ← Back to opportunities
      </Link>

      <section className="details-hero">
        <div className="details-hero__main">
          <span className="company-logo company-logo--large">
            {opportunity.company.charAt(0)}
          </span>
          <div>
            <div className="details-hero__badges">
              <StatusBadge status={opportunity.status} />
              {currentRole === "student" && (
                <EligibilityBadge student={student} opportunity={opportunity} />
              )}
            </div>
            <p>{opportunity.company}</p>
            <h2>{opportunity.role}</h2>
            <span>{opportunity.location}</span>
          </div>
        </div>
        {currentRole === "student" && (
          <BookmarkButton opportunityId={opportunity.id} />
        )}
      </section>

      <div className="details-layout">
        <div className="details-layout__main">
          <section className="content-card">
            <p className="eyebrow">About the role</p>
            <h3>Opportunity overview</h3>
            <p>{opportunity.description}</p>
          </section>

          <section className="content-card">
            <p className="eyebrow">Requirements</p>
            <h3>Eligibility criteria</h3>
            <div className="criteria-grid">
              <div>
                <span>Eligible branches</span>
                <strong>{opportunity.eligibleBranches.join(", ")}</strong>
              </div>
              <div>
                <span>Minimum CGPA</span>
                <strong>{opportunity.minimumCgpa}</strong>
              </div>
              <div>
                <span>Maximum backlogs</span>
                <strong>{opportunity.maximumBacklogs}</strong>
              </div>
              <div>
                <span>Graduation year</span>
                <strong>{opportunity.graduationYear}</strong>
              </div>
            </div>
          </section>

          {currentRole === "student" && (
            <section
              className={`eligibility-panel eligibility-panel--${eligibility.status}`}
            >
              <div>
                <p className="eyebrow">Your eligibility</p>
                <h3>{eligibility.label}</h3>
              </div>
              {eligibility.reasons.length === 0 ? (
                <p>Your profile meets every requirement for this role.</p>
              ) : (
                <ul>
                  {eligibility.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <aside className="application-card">
          <p>Package</p>
          <strong>{opportunity.package}</strong>
          <hr />
          <div>
            <span>Application deadline</span>
            <b>{formatDate(opportunity.deadline)}</b>
          </div>
          <div>
            <span>Work location</span>
            <b>{opportunity.location}</b>
          </div>
          {currentRole === "student" && opportunity.status === "active" && (
            <a
              className="button button--primary button--full"
              href={opportunity.applicationLink}
              target="_blank"
              rel="noreferrer"
            >
              Open application ↗
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}

export default OpportunityDetailsPage;
