import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import opportunityData from "../data/opportunities.json";
import announcementData from "../data/announcements.json";
import eventData from "../data/events.json";
import studentData from "../data/student.json";
import { campusApi } from "../services/api";

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
  const [events, setEvents] = useState(() =>
    getStoredValue("campus-events", eventData),
  );
  const [bookmarks, setBookmarks] = useState(() =>
    getStoredValue("campus-bookmarks", []),
  );
  const [trackerEntries, setTrackerEntries] = useState(getInitialTrackerEntries);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() =>
    getStoredValue("campus-read-announcements", []),
  );
  const [student, setStudent] = useState(() =>
    getStoredValue("campus-student-profile", studentData),
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [apiNotice, setApiNotice] = useState("");

  useEffect(() => {
    let ignoreResponse = false;

    async function loadApiData() {
      const resources = await Promise.allSettled([
        campusApi.getOpportunities(),
        campusApi.getAnnouncements(),
        campusApi.getEvents(),
        campusApi.getBookmarks(),
        campusApi.getApplications(),
        campusApi.getProfile(),
        campusApi.getReadAnnouncements(),
      ]);

      if (ignoreResponse) return;

      const applyResource = (index, setter, storageKey, transform = (data) => data) => {
        const result = resources[index];
        if (result.status !== "fulfilled") return;

        const value = transform(result.value);
        setter(value);
        localStorage.setItem(storageKey, JSON.stringify(value));
      };

      applyResource(0, setOpportunities, "campus-opportunities");
      applyResource(1, setAnnouncements, "campus-announcements");
      applyResource(2, setEvents, "campus-events");
      applyResource(3, setBookmarks, "campus-bookmarks", (bookmarksData) =>
        bookmarksData.map((bookmark) => bookmark.opportunityId),
      );
      applyResource(4, setTrackerEntries, "campus-tracker-entries");
      applyResource(5, setStudent, "campus-student-profile");
      applyResource(
        6,
        setReadAnnouncementIds,
        "campus-read-announcements",
      );

      const failedCount = resources.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failedCount === resources.length) {
        setApiNotice(
          "The API is unavailable. CampusConnect is using saved offline data.",
        );
      } else if (failedCount > 0) {
        setApiNotice(
          "Some campus data could not be refreshed. Saved data is shown where needed.",
        );
      } else {
        setApiNotice("");
      }
      setIsInitialLoading(false);
    }

    loadApiData();

    return () => {
      ignoreResponse = true;
    };
  }, []);

  function login(role) {
    setCurrentRole(role);
    localStorage.setItem("campus-role", JSON.stringify(role));
  }

  function logout() {
    setCurrentRole(null);
    localStorage.removeItem("campus-role");
  }

  async function addOpportunity(opportunity) {
    try {
      const createdOpportunity = await campusApi.createOpportunity(opportunity);

      setOpportunities((currentOpportunities) => {
        const updatedOpportunities = [
          createdOpportunity,
          ...currentOpportunities.filter(
            (item) => item.id !== createdOpportunity.id,
          ),
        ];

        localStorage.setItem(
          "campus-opportunities",
          JSON.stringify(updatedOpportunities),
        );

        return updatedOpportunities;
      });

      setApiNotice("");
      return createdOpportunity;
    } catch {
      const createdOpportunity = {
        ...opportunity,
        id: `opp-${Date.now()}`,
      };

      setOpportunities((currentOpportunities) => {
        const updatedOpportunities = [
          createdOpportunity,
          ...currentOpportunities,
        ];

        localStorage.setItem(
          "campus-opportunities",
          JSON.stringify(updatedOpportunities),
        );

        return updatedOpportunities;
      });

      setApiNotice(
        "The opportunity was saved only in this browser because the API is unavailable.",
      );
      return createdOpportunity;
    }
  }

  async function addAnnouncement(announcement) {
    let createdAnnouncement;

    try {
      createdAnnouncement = await campusApi.createAnnouncement(announcement);
      setApiNotice("");
    } catch {
      createdAnnouncement = {
        ...announcement,
        body: announcement.body || announcement.message,
        id: `ann-${Date.now()}`,
      };
      setApiNotice(
        "The announcement was saved only in this browser because the API is unavailable.",
      );
    }

    setAnnouncements((currentAnnouncements) => {
      const updatedAnnouncements = [
        createdAnnouncement,
        ...currentAnnouncements.filter(
          (item) => item.id !== createdAnnouncement.id,
        ),
      ];
      localStorage.setItem(
        "campus-announcements",
        JSON.stringify(updatedAnnouncements),
      );
      return updatedAnnouncements;
    });

    return createdAnnouncement;
  }

  async function toggleBookmark(opportunityId) {
    const isBookmarked = bookmarks.includes(opportunityId);
    const updatedBookmarks = bookmarks.includes(opportunityId)
      ? bookmarks.filter((id) => id !== opportunityId)
      : [...bookmarks, opportunityId];

    setBookmarks(updatedBookmarks);
    localStorage.setItem(
      "campus-bookmarks",
      JSON.stringify(updatedBookmarks),
    );

    try {
      if (isBookmarked) {
        await campusApi.deleteBookmark(opportunityId);
      } else {
        await campusApi.createBookmark(opportunityId);
      }
      setApiNotice("");
    } catch {
      setApiNotice(
        "The bookmark was saved only in this browser because the API is unavailable.",
      );
    }
  }

  function saveTrackerEntries(entries) {
    setTrackerEntries(entries);
    localStorage.setItem("campus-tracker-entries", JSON.stringify(entries));
  }

  async function addTrackerEntry(entry) {
    let createdEntry;
    try {
      createdEntry = await campusApi.createApplication(entry);
      setApiNotice("");
    } catch {
      createdEntry = { ...entry, id: `tracker-${Date.now()}` };
      setApiNotice(
        "The tracker entry was saved only in this browser because the API is unavailable.",
      );
    }
    saveTrackerEntries([createdEntry, ...trackerEntries]);
    return createdEntry;
  }

  async function updateTrackerEntry(entryId, updates) {
    let updatedEntry;
    try {
      updatedEntry = await campusApi.updateApplication(entryId, updates);
      setApiNotice("");
    } catch {
      updatedEntry = { ...updates, id: entryId };
      setApiNotice(
        "The tracker update was saved only in this browser because the API is unavailable.",
      );
    }
    saveTrackerEntries(
      trackerEntries.map((entry) =>
        entry.id === entryId ? { ...entry, ...updatedEntry } : entry,
      ),
    );
    return updatedEntry;
  }

  async function deleteTrackerEntry(entryId) {
    try {
      await campusApi.deleteApplication(entryId);
      setApiNotice("");
    } catch {
      setApiNotice(
        "The tracker entry was removed only in this browser because the API is unavailable.",
      );
    }
    saveTrackerEntries(trackerEntries.filter((entry) => entry.id !== entryId));
  }

  async function toggleAnnouncementRead(announcementId) {
    const isRead = readAnnouncementIds.includes(announcementId);
    const updatedIds = readAnnouncementIds.includes(announcementId)
      ? readAnnouncementIds.filter((id) => id !== announcementId)
      : [...readAnnouncementIds, announcementId];

    setReadAnnouncementIds(updatedIds);
    localStorage.setItem(
      "campus-read-announcements",
      JSON.stringify(updatedIds),
    );

    try {
      if (isRead) {
        await campusApi.markAnnouncementUnread(announcementId);
      } else {
        await campusApi.markAnnouncementRead(announcementId);
      }
      setApiNotice("");
    } catch {
      setApiNotice(
        "The read status was saved only in this browser because the API is unavailable.",
      );
    }
  }

  async function updateStudentProfile(updates) {
    try {
      const updatedStudent = await campusApi.updateProfile(updates);
      setStudent(updatedStudent);
      localStorage.setItem(
        "campus-student-profile",
        JSON.stringify(updatedStudent),
      );
      setApiNotice("");
      return updatedStudent;
    } catch {
      const updatedStudent = { ...student, ...updates };
      setStudent(updatedStudent);
      localStorage.setItem(
        "campus-student-profile",
        JSON.stringify(updatedStudent),
      );
      setApiNotice(
        "The profile update was saved only in this browser because the API is unavailable.",
      );
      return updatedStudent;
    }
  }

  const unreadAnnouncementCount = announcements.filter(
    (announcement) => !readAnnouncementIds.includes(announcement.id),
  ).length;

  const value = useMemo(
    () => ({
      currentRole,
      opportunities,
      announcements,
      events,
      bookmarks,
      trackerEntries,
      readAnnouncementIds,
      unreadAnnouncementCount,
      apiNotice,
      isInitialLoading,
      student,
      login,
      logout,
      addOpportunity,
      addAnnouncement,
      toggleBookmark,
      addTrackerEntry,
      updateTrackerEntry,
      deleteTrackerEntry,
      toggleAnnouncementRead,
      updateStudentProfile,
      clearApiNotice: () => setApiNotice(""),
    }),
    [
      currentRole,
      opportunities,
      announcements,
      events,
      bookmarks,
      trackerEntries,
      readAnnouncementIds,
      unreadAnnouncementCount,
      apiNotice,
      isInitialLoading,
      student,
    ],
  );

  return (
    <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
