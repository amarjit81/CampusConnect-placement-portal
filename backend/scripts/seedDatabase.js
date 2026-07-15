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

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 12);

  return User.findOneAndUpdate(
    { email },
    { name, email, passwordHash, role, isActive: true },
    { upsert: true, returnDocument: "after", runValidators: true },
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
    name: "Arjun Sharma",
    email: "student@campusconnect.edu",
    password: "Student@123",
    role: "student",
  });

  await StudentProfile.findOneAndUpdate(
    { user: student._id },
    {
      user: student._id,
      enrollmentNumber: "CC2027CSE001",
      branch: "CSE",
      cgpa: 8.2,
      activeBacklogs: 0,
      graduationYear: 2027,
      phone: "+91 98765 43210",
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  return { admin, student };
}

async function seedOpportunities(admin) {
  const records = [
    {
      company: "TechNova",
      role: "Graduate Software Engineer",
      description:
        "Join the product engineering team to build web applications and collaborate with senior developers.",
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
      description:
        "Clean datasets, create dashboards, and communicate useful business insights.",
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
      description:
        "A training program covering production planning, quality systems, and manufacturing operations.",
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
  ];

  return Promise.all(
    records.map((record) =>
      Opportunity.findOneAndUpdate(
        { company: record.company, role: record.role },
        { ...record, createdBy: admin._id },
        { upsert: true, returnDocument: "after", runValidators: true },
      ),
    ),
  );
}

async function seedRelatedRecords({ admin, student, opportunities }) {
  await Application.findOneAndUpdate(
    { student: student._id, opportunity: opportunities[0]._id },
    {
      student: student._id,
      opportunity: opportunities[0]._id,
      status: "in-progress",
      currentRound: "Technical Interview",
      nextStep: "Attend the scheduled technical interview",
      notes: "Revise DSA, DBMS, and OOP concepts.",
      appliedAt: new Date("2026-07-05T10:00:00.000Z"),
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  await Bookmark.findOneAndUpdate(
    { student: student._id, opportunity: opportunities[1]._id },
    { student: student._id, opportunity: opportunities[1]._id },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  await Announcement.findOneAndUpdate(
    { title: "TechNova interview schedule released" },
    {
      createdBy: admin._id,
      title: "TechNova interview schedule released",
      message: "The technical interview schedule for shortlisted candidates is available.",
      body: "Shortlisted students should report to the placement cell 20 minutes before their assigned slot with a resume and college ID.",
      important: true,
      audience: "students",
      attachment: {
        name: "Interview_Schedule.pdf",
        type: "PDF",
        url: "https://example.com/files/interview-schedule.pdf",
      },
      publishedAt: new Date("2026-07-14T09:00:00.000Z"),
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  await Event.findOneAndUpdate(
    { title: "Resume Review Workshop" },
    {
      createdBy: admin._id,
      title: "Resume Review Workshop",
      description: "Bring your latest resume for feedback from the placement team.",
      eventType: "workshop",
      startsAt: new Date("2026-07-20T08:30:00.000Z"),
      endsAt: new Date("2026-07-20T10:30:00.000Z"),
      location: "Training and Placement Cell",
      audience: "students",
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );
}

async function seedDatabase() {
  await connectDatabase();
  const { admin, student } = await seedUsers();
  const opportunities = await seedOpportunities(admin);
  await seedRelatedRecords({ admin, student, opportunities });

  console.log("CampusConnect seed data is ready.");
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
