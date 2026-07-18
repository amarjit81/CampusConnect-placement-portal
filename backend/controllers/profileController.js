const { StudentProfile } = require("../models");
const {
  pickFields,
  sendDatabaseError,
  findDemoUser,
} = require("./controllerHelpers");

const writableFields = [
  "enrollmentNumber",
  "branch",
  "cgpa",
  "activeBacklogs",
  "graduationYear",
  "phone",
  "skills",
  "resumeUrl",
];

function serializeProfile(document, user) {
  const profile = document.toObject ? document.toObject() : document;
  return {
    id: String(profile._id || profile.id),
    userId: String(user._id || user.id),
    name: user.name,
    email: user.email,
    enrollmentNumber: profile.enrollmentNumber,
    rollNumber: profile.enrollmentNumber,
    branch: profile.branch,
    cgpa: profile.cgpa,
    activeBacklogs: profile.activeBacklogs,
    backlogs: profile.activeBacklogs,
    graduationYear: profile.graduationYear,
    phone: profile.phone,
    skills: profile.skills,
    resumeUrl: profile.resumeUrl,
    updatedAt: profile.updatedAt,
  };
}

async function getProfile(req, res) {
  try {
    const student = await findDemoUser("student");
    const profile = await StudentProfile.findOne({ user: student._id });
    if (!profile) return res.status(404).json({ message: "Student profile not found" });
    return res.status(200).json(serializeProfile(profile, student));
  } catch (error) {
    return sendDatabaseError(res, error, "Student profile");
  }
}

async function updateProfile(req, res) {
  try {
    const student = await findDemoUser("student");
    const profile = await StudentProfile.findOneAndUpdate(
      { user: student._id },
      pickFields(req.body, writableFields),
      { new: true, runValidators: true },
    );
    if (!profile) return res.status(404).json({ message: "Student profile not found" });
    return res.status(200).json(serializeProfile(profile, student));
  } catch (error) {
    return sendDatabaseError(res, error, "Student profile");
  }
}

module.exports = { getProfile, updateProfile, serializeProfile };
