import React, { createContext, useContext, useMemo, useState } from "react";
import opportunityData from "../data/opportunities.json";
import announcementData from "../data/announcements.json";
import studentData from "../data/student.json";

const CampusContext = createContext();

function getStoredValue(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredOpportunities() {
  const stored = getStoredValue("campus-opportunities", null);
  if (!stored) return opportunityData;

  const seedById = new Map(opportunityData.map((item) => [item.id, item]));
  const mockDataFields = [
    "company",
    "role",
    "package",
    "location",
    "deadline",
    "status",
    "eligibleBranches",
    "minimumCgpa",
    "maximumBacklogs",
    "graduationYear",
    "eligible",
    "missedCriteria",
    "applied",
    "appliedDate",
    "currentRound",
    "applicationStatus",
    "nextStep",
    "notes",
  ];
  const merged = stored.map((item) => {
    const seed = seedById.get(item.id);
    if (!seed) return item;

    const currentMockData = Object.fromEntries(
      mockDataFields.map((field) => [field, seed[field]]),
    );
    return { ...seed, ...item, ...currentMockData };
  });
  const storedIds = new Set(stored.map((item) => item.id));

  return [
    ...merged,
    ...opportunityData.filter((item) => !storedIds.has(item.id)),
  ];
}

function getStoredAnnouncements() {
  const stored = getStoredValue("campus-announcements", null);
  if (!stored) return announcementData;

  const seedById = new Map(announcementData.map((item) => [item.id, item]));
  const merged = stored.map((item) =>
    seedById.has(item.id) ? { ...item, ...seedById.get(item.id) } : item,
  );
  const storedIds = new Set(stored.map((item) => item.id));

  return [
    ...merged,
    ...announcementData.filter((item) => !storedIds.has(item.id)),
  ];
}

function getInitialTrackerEntries() {
  const stored = getStoredValue("campus-tracker-entries", null);
  if (stored) return stored;

  return opportunityData
    .filter((opportunity) => opportunity.applied)
    .map((opportunity) => ({
      id: `tracker-${opportunity.id}`,
      company: opportunity.company,
      role: opportunity.role,
      appliedDate: opportunity.appliedDate,
      currentRound: opportunity.currentRound,
      applicationStatus: opportunity.applicationStatus,
      nextStep: opportunity.nextStep,
      notes: opportunity.notes,
    }));
}

export function CampusProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() =>
    getStoredValue("campus-role", null),
  );
  const [opportunities, setOpportunities] = useState(getStoredOpportunities);
  const [announcements, setAnnouncements] = useState(getStoredAnnouncements);
  const [bookmarks, setBookmarks] = useState(() =>
    getStoredValue("campus-bookmarks", []),
  );
  const [trackerEntries, setTrackerEntries] = useState(getInitialTrackerEntries);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() =>
    getStoredValue("campus-read-announcements", []),
  );

  function login(role) {
    setCurrentRole(role);
    localStorage.setItem("campus-role", JSON.stringify(role));
  }

  function logout() {
    setCurrentRole(null);
    localStorage.removeItem("campus-role");
  }

  function addOpportunity(opportunity) {
    const updatedOpportunities = [
      { ...opportunity, id: `opp-${Date.now()}` },
      ...opportunities,
    ];
    setOpportunities(updatedOpportunities);
    localStorage.setItem(
      "campus-opportunities",
      JSON.stringify(updatedOpportunities),
    );
  }

  function addAnnouncement(announcement) {
    const updatedAnnouncements = [
      { ...announcement, id: `ann-${Date.now()}` },
      ...announcements,
    ];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem(
      "campus-announcements",
      JSON.stringify(updatedAnnouncements),
    );
  }

  function toggleBookmark(opportunityId) {
    const updatedBookmarks = bookmarks.includes(opportunityId)
      ? bookmarks.filter((id) => id !== opportunityId)
      : [...bookmarks, opportunityId];

    setBookmarks(updatedBookmarks);
    localStorage.setItem(
      "campus-bookmarks",
      JSON.stringify(updatedBookmarks),
    );
  }

  function saveTrackerEntries(entries) {
    setTrackerEntries(entries);
    localStorage.setItem("campus-tracker-entries", JSON.stringify(entries));
  }

  function addTrackerEntry(entry) {
    saveTrackerEntries([
      {
        ...entry,
        id: `tracker-${Date.now()}`,
      },
      ...trackerEntries,
    ]);
  }

  function updateTrackerEntry(entryId, updates) {
    saveTrackerEntries(
      trackerEntries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updates } : entry,
      ),
    );
  }

  function deleteTrackerEntry(entryId) {
    saveTrackerEntries(trackerEntries.filter((entry) => entry.id !== entryId));
  }

  function toggleAnnouncementRead(announcementId) {
    const updatedIds = readAnnouncementIds.includes(announcementId)
      ? readAnnouncementIds.filter((id) => id !== announcementId)
      : [...readAnnouncementIds, announcementId];

    setReadAnnouncementIds(updatedIds);
    localStorage.setItem(
      "campus-read-announcements",
      JSON.stringify(updatedIds),
    );
  }

  const unreadAnnouncementCount = announcements.filter(
    (announcement) => !readAnnouncementIds.includes(announcement.id),
  ).length;

  const value = useMemo(
    () => ({
      currentRole,
      opportunities,
      announcements,
      bookmarks,
      trackerEntries,
      readAnnouncementIds,
      unreadAnnouncementCount,
      student: studentData,
      login,
      logout,
      addOpportunity,
      addAnnouncement,
      toggleBookmark,
      addTrackerEntry,
      updateTrackerEntry,
      deleteTrackerEntry,
      toggleAnnouncementRead,
    }),
    [
      currentRole,
      opportunities,
      announcements,
      bookmarks,
      trackerEntries,
      readAnnouncementIds,
      unreadAnnouncementCount,
    ],
  );

  return (
    <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
