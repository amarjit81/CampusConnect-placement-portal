const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const models = require("../models");

const minimumCounts = {
  User: 2,
  StudentProfile: 1,
  Opportunity: 6,
  Application: 3,
  Bookmark: 3,
  Announcement: 5,
  AnnouncementRead: 1,
  Event: 7,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyCountsAndIndexes() {
  const counts = {};

  for (const [name, Model] of Object.entries(models)) {
    await Model.init();
    counts[name] = await Model.countDocuments();
    assert(
      counts[name] >= minimumCounts[name],
      `${name} has ${counts[name]} record(s); expected at least ${minimumCounts[name]}`,
    );
  }

  return counts;
}

async function verifyRelationships() {
  const profiles = await models.StudentProfile.find().populate("user").lean();
  const opportunities = await models.Opportunity.find().populate("createdBy").lean();
  const applications = await models.Application.find()
    .populate("student")
    .populate("opportunity")
    .lean();
  const bookmarks = await models.Bookmark.find()
    .populate("student")
    .populate("opportunity")
    .lean();
  const announcements = await models.Announcement.find().populate("createdBy").lean();
  const announcementReads = await models.AnnouncementRead.find()
    .populate("student")
    .populate("announcement")
    .lean();
  const events = await models.Event.find()
    .populate("createdBy")
    .populate("opportunity")
    .lean();

  profiles.forEach((profile) => {
    assert(profile.user, `StudentProfile ${profile._id} has no user`);
    assert(profile.user.role === "student", `StudentProfile ${profile._id} is not linked to a student`);
  });
  opportunities.forEach((record) => {
    assert(record.createdBy?.role === "admin", `Opportunity ${record._id} has no Admin creator`);
  });
  applications.forEach((record) => {
    assert(record.student?.role === "student", `Application ${record._id} has no student`);
    assert(record.opportunity, `Application ${record._id} has no opportunity`);
  });
  bookmarks.forEach((record) => {
    assert(record.student?.role === "student", `Bookmark ${record._id} has no student`);
    assert(record.opportunity, `Bookmark ${record._id} has no opportunity`);
  });
  announcements.forEach((record) => {
    assert(record.createdBy?.role === "admin", `Announcement ${record._id} has no Admin creator`);
  });
  announcementReads.forEach((record) => {
    assert(record.student?.role === "student", `AnnouncementRead ${record._id} has no student`);
    assert(record.announcement, `AnnouncementRead ${record._id} has no announcement`);
  });
  events.forEach((record) => {
    assert(record.createdBy?.role === "admin", `Event ${record._id} has no Admin creator`);
    if (record.opportunity) {
      assert(record.company === record.opportunity.company, `Event ${record._id} company does not match its opportunity`);
    }
  });

  return {
    profiles: profiles.length,
    opportunities: opportunities.length,
    applications: applications.length,
    bookmarks: bookmarks.length,
    announcements: announcements.length,
    announcementReads: announcementReads.length,
    events: events.length,
  };
}

async function verifyDatabase() {
  await connectDatabase();
  const counts = await verifyCountsAndIndexes();
  const relationships = await verifyRelationships();

  console.log("Collection counts:", counts);
  console.log("Verified relationships:", relationships);
  console.log("Database verification passed.");
}

verifyDatabase()
  .catch((error) => {
    console.error("Database verification failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
