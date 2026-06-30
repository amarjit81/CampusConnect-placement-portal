import { checkEligibility } from "../../utils/eligibility";

function EligibilityBadge({ student, opportunity }) {
  const result = checkEligibility(student, opportunity);

  return (
    <span className={`eligibility-badge eligibility-badge--${result.status}`}>
      {result.label}
    </span>
  );
}

export default EligibilityBadge;
