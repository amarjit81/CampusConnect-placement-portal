import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveStudentOpportunities,
  isApplied,
  isEligible,
  isNotApplied,
} from "./opportunityStatus.js";

const student = {
  branch: "CSE",
  cgpa: 7.8,
  backlogs: 0,
  graduationYear: 2027,
};

const opportunities = [
  {
    id: "eligible-applied",
    eligibleBranches: ["CSE", "IT"],
    minimumCgpa: 7,
    maximumBacklogs: 0,
    graduationYear: 2027,
  },
  {
    id: "eligible-not-applied",
    eligibleBranches: ["CSE"],
    minimumCgpa: 7.5,
    maximumBacklogs: 1,
    graduationYear: 2027,
  },
  {
    id: "wrong-branch",
    eligibleBranches: ["ME"],
    minimumCgpa: 7,
    maximumBacklogs: 0,
    graduationYear: 2027,
  },
];

const applications = [
  {
    id: "application-1",
    opportunityId: "eligible-applied",
    appliedDate: "2026-07-05",
    currentRound: "Technical Interview",
    applicationStatus: "In Progress",
    nextStep: "Attend interview",
    notes: "Revise DSA",
  },
  {
    id: "manual-entry",
    opportunityId: null,
    company: "Manual Company",
    role: "Manual Role",
  },
];

test("derives eligibility and application state from canonical student data", () => {
  const derived = deriveStudentOpportunities(
    opportunities,
    student,
    applications,
  );

  assert.equal(derived.filter(isEligible).length, 2);
  assert.equal(derived.filter(isApplied).length, 1);
  assert.equal(derived.filter(isNotApplied).length, 1);
  assert.equal(derived[0].applicationStatus, "In Progress");
  assert.equal(derived[0].appliedDate, "2026-07-05");
  assert.equal(derived[2].missedCriteria[0].label, "Allowed branches");
});

test("recomputes results when the student profile changes", () => {
  const updatedStudent = { ...student, cgpa: 6.5 };
  const derived = deriveStudentOpportunities(
    opportunities,
    updatedStudent,
    applications,
  );

  assert.equal(derived.filter(isEligible).length, 0);
  assert.equal(derived.filter(isApplied).length, 1);
  assert.equal(derived.filter(isNotApplied).length, 0);
});

test("recomputes application state when tracker records change", () => {
  const derived = deriveStudentOpportunities(opportunities, student, []);

  assert.equal(derived.filter(isApplied).length, 0);
  assert.equal(derived.filter(isNotApplied).length, 2);
  assert.equal(derived[0].appliedDate, null);
  assert.equal(opportunities[0].applied, undefined);
});
