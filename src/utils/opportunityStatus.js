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
