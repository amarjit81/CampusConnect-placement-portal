import { checkEligibility } from "./eligibility.js";

export function isEligible(opportunity) {
  return opportunity.eligible === true;
}

export function isNotEligible(opportunity) {
  return opportunity.eligible === false;
}

export function isApplied(opportunity) {
  return opportunity.applied === true;
}

export function isNotApplied(opportunity) {
  return isEligible(opportunity) && opportunity.applied === false;
}

export function deriveStudentOpportunities(
  opportunities,
  student,
  applications,
) {
  const applicationsByOpportunityId = new Map(
    applications
      .filter((application) => application.opportunityId)
      .map((application) => [String(application.opportunityId), application]),
  );

  return opportunities.map((opportunity) => {
    const eligibility = checkEligibility(student, opportunity);
    const application = applicationsByOpportunityId.get(String(opportunity.id));

    return {
      ...opportunity,
      eligible: eligibility.status === "eligible",
      missedCriteria: eligibility.missedCriteria,
      applied: Boolean(application),
      appliedDate: application?.appliedDate || null,
      currentRound: application?.currentRound || null,
      applicationStatus: application?.applicationStatus || null,
      nextStep: application?.nextStep || null,
      notes: application?.notes || null,
    };
  });
}
