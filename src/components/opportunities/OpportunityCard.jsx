import { Link } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import EligibilityBadge from "./EligibilityBadge";
import BookmarkButton from "./BookmarkButton";
import StatusBadge from "../common/StatusBadge";
import { checkEligibility } from "../../utils/eligibility";
import ApplicationBadge from "./ApplicationBadge";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function OpportunityCard({ opportunity }) {
  const { currentRole, student } = useCampus();
  const detailsPath = `/${currentRole}/opportunities/${opportunity.id}`;
  const eligibility =
    currentRole === "student" ? checkEligibility(student, opportunity) : null;

  return (
    <article className="opportunity-card">
      <div className="opportunity-card__header">
        {currentRole === "admin" && (
          <span className="company-logo">{opportunity.company.charAt(0)}</span>
        )}
        <div className="opportunity-card__title">
          <p>{opportunity.company}</p>
          <h3>{opportunity.role}</h3>
        </div>
        {currentRole === "student" && (
          <BookmarkButton opportunityId={opportunity.id} compact />
        )}
      </div>

      <div className="opportunity-card__badges">
        <StatusBadge status={opportunity.status} />
        {currentRole === "student" && (
          <>
            <EligibilityBadge student={student} opportunity={opportunity} />
            <ApplicationBadge applied={opportunity.applied} />
          </>
        )}
      </div>

      <dl className="opportunity-card__details">
        <div>
          <dt>Package</dt>
          <dd>{opportunity.package}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{opportunity.location}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{formatDate(opportunity.deadline)}</dd>
        </div>
      </dl>

      {eligibility?.status === "not-eligible" && (
        <section className="missed-criteria">
          <strong>Why Not Eligible?</strong>
          <div className="missed-criteria__list">
            {eligibility.missedCriteria.map((criterion) => (
              <div key={criterion.label}>
                <span>
                  {criterion.label}: {criterion.required}
                </span>
                <small>
                  {criterion.actualLabel}: {criterion.actual}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link className="text-link" to={detailsPath}>
        View details <span>→</span>
      </Link>
    </article>
  );
}

export default OpportunityCard;
