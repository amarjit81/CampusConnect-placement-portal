export function checkEligibility(student, opportunity) {
  const reasons = [];
  const missedCriteria = [];

  if (!opportunity.eligibleBranches.includes(student.branch)) {
    reasons.push(`Your branch (${student.branch}) is not eligible.`);
    missedCriteria.push({
      label: "Allowed branches",
      required: opportunity.eligibleBranches.join(", "),
      actualLabel: "Your branch",
      actual: student.branch,
    });
  }

  if (student.cgpa < opportunity.minimumCgpa) {
    reasons.push(`A minimum CGPA of ${opportunity.minimumCgpa} is required.`);
    missedCriteria.push({
      label: "Minimum CGPA required",
      required: opportunity.minimumCgpa,
      actualLabel: "Your CGPA",
      actual: student.cgpa,
    });
  }

  if (student.backlogs > opportunity.maximumBacklogs) {
    reasons.push(
      `A maximum of ${opportunity.maximumBacklogs} active backlog(s) is allowed.`,
    );
    missedCriteria.push({
      label: "Maximum backlogs allowed",
      required: opportunity.maximumBacklogs,
      actualLabel: "Your backlogs",
      actual: student.backlogs,
    });
  }

  if (student.graduationYear !== opportunity.graduationYear) {
    reasons.push(
      `This opportunity is for the ${opportunity.graduationYear} graduating batch.`,
    );
    missedCriteria.push({
      label: "Required graduation year",
      required: opportunity.graduationYear,
      actualLabel: "Your graduation year",
      actual: student.graduationYear,
    });
  }

  if (reasons.length === 0) {
    return {
      status: "eligible",
      label: "Eligible",
      reasons: [],
      missedCriteria: [],
    };
  }

  return {
    status: "not-eligible",
    label: "Not Eligible",
    reasons,
    missedCriteria,
  };
}
