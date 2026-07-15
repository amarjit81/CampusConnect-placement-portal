const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const {
  User,
  StudentProfile,
  Opportunity,
  Application,
  Bookmark,
  Announcement,
  Event,
} = require("../models");

const updateOptions = {
  upsert: true,
  returnDocument: "after",
  runValidators: true,
  setDefaultsOnInsert: true,
};

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);
  return User.findOneAndUpdate(
    { email },
    { name, email, passwordHash, role, isActive: true },
    updateOptions,
  );
}

async function seedUsers() {
  const admin = await upsertUser({
    name: "Placement Administrator",
    email: "admin@campusconnect.edu",
    password: "Admin@123",
    role: "admin",
  });
  const student = await upsertUser({
    name: "Aarav Sharma",
    email: "student@campusconnect.edu",
    password: "Student@123",
    role: "student",
  });

  await StudentProfile.findOneAndUpdate(
    { user: student._id },
    {
      user: student._id,
      enrollmentNumber: "CSE2027-042",
      branch: "CSE",
      cgpa: 7.8,
      activeBacklogs: 0,
      graduationYear: 2027,
      phone: "+91 98765 43210",
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    },
    updateOptions,
  );

  return { admin, student };
}

async function seedOpportunities(admin) {
  const records = [
    {
      company: "TechNova",
      role: "Graduate Software Engineer",
      description: "Build web applications with the product engineering team.",
      opportunityType: "full-time",
      location: "Bengaluru",
      package: "Rs. 8.5 LPA",
      eligibleBranches: ["CSE", "IT", "ECE"],
      minimumCgpa: 7,
      maximumBacklogs: 0,
      graduationYear: 2027,
      deadline: new Date("2026-07-30T18:29:59.000Z"),
      applicationLink: "https://example.com/technova",
      status: "active",
    },
    {
      company: "DataNest",
      role: "Data Analyst Intern",
      description: "Clean datasets, create dashboards, and communicate insights.",
      opportunityType: "internship",
      location: "Hyderabad",
      package: "Rs. 35,000/month",
      eligibleBranches: ["CSE", "IT", "ECE", "EEE"],
      minimumCgpa: 6.5,
      maximumBacklogs: 1,
      graduationYear: 2027,
      deadline: new Date("2026-08-15T18:29:59.000Z"),
      applicationLink: "https://example.com/datanest",
      status: "active",
    },
    {
      company: "CoreBuild Industries",
      role: "Graduate Engineer Trainee",
      description: "Train in production planning, quality, and manufacturing.",
      opportunityType: "full-time",
      location: "Pune",
      package: "Rs. 6.2 LPA",
      eligibleBranches: ["ME", "CE", "EEE"],
      minimumCgpa: 7.5,
      maximumBacklogs: 0,
      graduationYear: 2027,
      deadline: new Date("2026-08-25T18:29:59.000Z"),
      applicationLink: "https://example.com/corebuild",
      status: "active",
    },
    {
      company: "PixelCraft",
      role: "UI Developer",
      description: "Build accessible interfaces and shared UI components.",
      opportunityType: "full-time",
      location: "Remote",
      package: "Rs. 7 LPA",
      eligibleBranches: ["CSE", "IT"],
      minimumCgpa: 6,
      maximumBacklogs: 1,
      graduationYear: 2027,
      deadline: new Date("2026-06-12T18:29:59.000Z"),
      applicationLink: "https://example.com/pixelcraft",
      status: "closed",
    },
    {
      company: "FinEdge Labs",
      role: "Software Engineering Intern",
      description: "Build and test financial technology product features.",
      opportunityType: "internship",
      location: "Gurugram",
      package: "Rs. 45,000/month",
      eligibleBranches: ["IT", "COE"],
      minimumCgpa: 8,
      maximumBacklogs: 0,
      graduationYear: 2027,
      deadline: new Date("2026-08-22T18:29:59.000Z"),
      applicationLink: "https://example.com/finedge",
      status: "active",
    },
    {
      company: "CloudSprint",
      role: "Associate Platform Engineer",
      description: "Support cloud infrastructure and deployment automation.",
      opportunityType: "full-time",
      location: "Chennai",
      package: "Rs. 7.8 LPA",
      eligibleBranches: ["CSE", "IT", "ECE"],
      minimumCgpa: 7,
      maximumBacklogs: 0,
      graduationYear: 2027,
      deadline: new Date("2026-08-28T18:29:59.000Z"),
      applicationLink: "https://example.com/cloudsprint",
      status: "active",
    },
  ];

  return Promise.all(
    records.map((record) =>
      Opportunity.findOneAndUpdate(
        { company: record.company, role: record.role },
        { ...record, createdBy: admin._id },
        updateOptions,
      ),
    ),
  );
}

async function seedApplicationsAndBookmarks(student, opportunities) {
  const byCompany = new Map(
    opportunities.map((opportunity) => [opportunity.company, opportunity]),
  );
  const applications = [
    {
      company: "TechNova",
      status: "in-progress",
      currentRound: "Technical Interview",
      nextStep: "Attend the scheduled technical interview",
      notes: "Revise DSA, DBMS, and OOP concepts.",
      appliedAt: new Date("2026-07-05T10:00:00.000Z"),
    },
    {
      company: "DataNest",
      status: "shortlisted",
      currentRound: "HR Interview",
      nextStep: "Prepare a project walkthrough and introduction",
      notes: "Review common HR questions.",
      appliedAt: new Date("2026-07-08T10:00:00.000Z"),
    },
    {
      company: "PixelCraft",
      status: "rejected",
      currentRound: "Application Review",
      nextStep: "No further action",
      notes: "Continue improving accessibility portfolio examples.",
      appliedAt: new Date("2026-05-27T10:00:00.000Z"),
    },
  ];

  await Promise.all(
    applications.map(({ company, ...record }) => {
      const opportunity = byCompany.get(company);
      return Application.findOneAndUpdate(
        { student: student._id, opportunity: opportunity._id },
        { ...record, student: student._id, opportunity: opportunity._id },
        updateOptions,
      );
    }),
  );

  await Promise.all(
    ["TechNova", "DataNest", "CloudSprint"].map((company) => {
      const opportunity = byCompany.get(company);
      return Bookmark.findOneAndUpdate(
        { student: student._id, opportunity: opportunity._id },
        { student: student._id, opportunity: opportunity._id },
        updateOptions,
      );
    }),
  );
}

async function seedAnnouncements(admin) {
  const records = [
    {
      title: "TechNova interview schedule released",
      message: "The technical interview schedule is now available.",
      body: "Shortlisted students should report 20 minutes early with a resume and college ID.",
      important: true,
      audience: "students",
      attachment: {
        name: "Interview_Schedule.pdf",
        type: "PDF",
        url: "https://example.com/files/interview-schedule.pdf",
      },
      publishedAt: new Date("2026-07-14T09:00:00.000Z"),
    },
    {
      title: "Resume review desk",
      message: "Visit the placement office for resume feedback.",
      body: "The resume review desk is open from 2:00 PM to 4:00 PM.",
      important: false,
      audience: "students",
      publishedAt: new Date("2026-07-13T12:30:00.000Z"),
    },
    {
      title: "Aptitude practice resources",
      message: "A new aptitude practice pack is available.",
      body: "The pack covers quantitative ability, reasoning, and verbal ability.",
      important: false,
      audience: "students",
      publishedAt: new Date("2026-07-12T11:00:00.000Z"),
    },
    {
      title: "DataNest pre-placement briefing",
      message: "The briefing recording and role overview are available.",
      body: "Review the material before applying to the DataNest internship.",
      important: false,
      audience: "students",
      publishedAt: new Date("2026-07-11T10:00:00.000Z"),
    },
    {
      title: "Placement policy reminder",
      message: "Review the updated placement participation guidelines.",
      body: "Check attendance, offer acceptance, and document requirements.",
      important: true,
      audience: "all",
      publishedAt: new Date("2026-07-10T09:30:00.000Z"),
    },
  ];

  await Promise.all(
    records.map((record) =>
      Announcement.findOneAndUpdate(
        { title: record.title },
        { ...record, createdBy: admin._id },
        updateOptions,
      ),
    ),
  );
}

async function seedEvents(admin, opportunities) {
  const byCompany = new Map(
    opportunities.map((opportunity) => [opportunity.company, opportunity]),
  );
  const records = [
    ["TechNova pre-placement talk", "TechNova", "pre-placement-talk", "scheduled", "2026-07-18T05:30:00.000Z", "2026-07-18T06:30:00.000Z", "Seminar Hall A"],
    ["Graduate engineer online assessment", "TechNova", "online-assessment", "confirmed", "2026-07-20T04:30:00.000Z", "2026-07-20T06:00:00.000Z", "Computer Lab 3"],
    ["Technical interview schedule", "TechNova", "interview", "confirmed", "2026-07-24T04:30:00.000Z", "2026-07-24T11:30:00.000Z", "Training and Placement Cell"],
    ["DataNest HR interviews", "DataNest", "interview", "scheduled", "2026-07-27T09:00:00.000Z", "2026-07-27T12:00:00.000Z", "Online"],
    ["Data analyst application deadline", "DataNest", "deadline", "open", "2026-08-15T17:30:00.000Z", "2026-08-15T18:29:59.000Z", "Online"],
    ["UI developer result announcement", "PixelCraft", "company-activity", "expected", "2026-07-28T10:30:00.000Z", "2026-07-28T11:00:00.000Z", "Online"],
    ["Graduate engineer application deadline", "CoreBuild Industries", "deadline", "open", "2026-08-25T17:30:00.000Z", "2026-08-25T18:29:59.000Z", "Online"],
  ];

  await Promise.all(
    records.map(([title, company, eventType, status, startsAt, endsAt, location]) => {
      const opportunity = byCompany.get(company);
      return Event.findOneAndUpdate(
        { title },
        {
          createdBy: admin._id,
          opportunity: opportunity._id,
          title,
          description: `${title} for ${opportunity.role}.`,
          company,
          role: opportunity.role,
          eventType,
          status,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          location,
          audience: "students",
        },
        updateOptions,
      );
    }),
  );
}

async function seedDatabase() {
  await connectDatabase();
  const { admin, student } = await seedUsers();
  const opportunities = await seedOpportunities(admin);
  await seedApplicationsAndBookmarks(student, opportunities);
  await seedAnnouncements(admin);
  await seedEvents(admin, opportunities);

  console.log("CampusConnect seed data is ready for every collection.");
  console.log("Admin login: admin@campusconnect.edu / Admin@123");
  console.log("Student login: student@campusconnect.edu / Student@123");
}

seedDatabase()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
