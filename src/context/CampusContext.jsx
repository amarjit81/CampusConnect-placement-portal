/* eslint-disable react-refresh/only-export-components */
import {
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
import { campusApi, getAuthToken, setAuthToken } from "../services/api";
import { deriveStudentOpportunities } from "../utils/opportunityStatus";

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
  const [currentUser, setCurrentUser] = useState(() =>
    getAuthToken() ? getStoredValue("campus-auth-user", null) : null,
  );
  const [currentRole, setCurrentRole] = useState(
    () => currentUser?.role || null,
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
  const [adminApplications, setAdminApplications] = useState([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() =>
    getStoredValue("campus-read-announcements", []),
  );
  const [student, setStudent] = useState(() =>
    getStoredValue("campus-student-profile", studentData),
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(() => Boolean(getAuthToken()));
  const [apiNotice, setApiNotice] = useState("");

  function clearStudentSessionData() {
    setBookmarks([]);
    setTrackerEntries([]);
    setReadAnnouncementIds([]);
    setStudent(studentData);
    [
      "campus-bookmarks",
      "campus-tracker-entries",
      "campus-read-announcements",
      "campus-student-profile",
    ].forEach((key) => localStorage.removeItem(key));
  }

  useEffect(() => {
    let ignoreResponse = false;

    async function restoreSession() {
      if (!getAuthToken()) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const { user } = await campusApi.getCurrentUser();
        if (ignoreResponse) return;
        setCurrentUser(user);
        setCurrentRole(user.role);
        localStorage.setItem("campus-auth-user", JSON.stringify(user));
      } catch {
        if (ignoreResponse) return;
        setAuthToken(null);
        setCurrentUser(null);
        setCurrentRole(null);
        localStorage.removeItem("campus-auth-user");
      } finally {
        if (!ignoreResponse) setIsAuthLoading(false);
      }
    }

    restoreSession();

    const handleExpiredSession = () => {
      setCurrentUser(null);
      setCurrentRole(null);
      localStorage.removeItem("campus-auth-user");
      clearStudentSessionData();
    };
    window.addEventListener("campus-auth-expired", handleExpiredSession);

    return () => {
      ignoreResponse = true;
      window.removeEventListener("campus-auth-expired", handleExpiredSession);
    };
  }, []);

  useEffect(() => {
    let ignoreResponse = false;

    async function loadApiData() {
      if (!currentRole) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      const loaders = {
        opportunities: campusApi.getOpportunities,
        announcements: campusApi.getAnnouncements,
        events: campusApi.getEvents,
        ...(currentRole === "admin"
          ? { adminApplications: campusApi.getApplications }
          : {}),
        ...(currentRole === "student"
          ? {
              bookmarks: campusApi.getBookmarks,
              applications: campusApi.getApplications,
              profile: campusApi.getProfile,
              readAnnouncements: campusApi.getReadAnnouncements,
            }
          : {}),
      };
      const resourceEntries = Object.entries(loaders);
      const settledResources = await Promise.allSettled(
        resourceEntries.map(([, load]) => load()),
      );
      const resources = Object.fromEntries(
        resourceEntries.map(([name], index) => [name, settledResources[index]]),
      );

      if (ignoreResponse) return;

      const applyResource = (name, setter, storageKey, transform = (data) => data) => {
        const result = resources[name];
        if (result.status !== "fulfilled") return;

        const value = transform(result.value);
        setter(value);
        localStorage.setItem(storageKey, JSON.stringify(value));
      };

      applyResource("opportunities", setOpportunities, "campus-opportunities");
      applyResource("announcements", setAnnouncements, "campus-announcements");
      applyResource("events", setEvents, "campus-events");
      if (currentRole === "admin") {
        const result = resources.adminApplications;
        if (result?.status === "fulfilled") setAdminApplications(result.value);
      }
      if (currentRole === "student") {
        applyResource("bookmarks", setBookmarks, "campus-bookmarks", (data) =>
          data.map((bookmark) => bookmark.opportunityId),
        );
        applyResource("applications", setTrackerEntries, "campus-tracker-entries");
        applyResource("profile", setStudent, "campus-student-profile");
        applyResource(
          "readAnnouncements",
          setReadAnnouncementIds,
          "campus-read-announcements",
        );
      }

      const failedCount = settledResources.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failedCount === settledResources.length) {
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
  }, [currentRole]);

  async function login(credentials) {
    const { token, user } = await campusApi.login(credentials);
    setAuthToken(token);
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem("campus-auth-user", JSON.stringify(user));
    localStorage.removeItem("campus-role");
    setApiNotice("");
    return user;
  }

  function logout() {
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem("campus-auth-user");
    localStorage.removeItem("campus-role");
    clearStudentSessionData();
  }

  function reportMutationError(error) {
    setApiNotice(error.message || "The request could not be completed.");
    throw error;
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
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function updateOpportunity(opportunityId, updates) {
    try {
      const updatedOpportunity = await campusApi.updateOpportunity(
        opportunityId,
        updates,
      );
      setOpportunities((current) => {
        const next = current.map((item) =>
          item.id === opportunityId ? updatedOpportunity : item,
        );
        localStorage.setItem("campus-opportunities", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
      return updatedOpportunity;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function deleteOpportunity(opportunityId) {
    try {
      await campusApi.deleteOpportunity(opportunityId);
      setOpportunities((current) => {
        const next = current.filter((item) => item.id !== opportunityId);
        localStorage.setItem("campus-opportunities", JSON.stringify(next));
        return next;
      });
      setBookmarks((current) => {
        const next = current.filter((id) => id !== opportunityId);
        localStorage.setItem("campus-bookmarks", JSON.stringify(next));
        return next;
      });
      setTrackerEntries((current) => {
        const next = current.filter(
          (entry) => entry.opportunityId !== opportunityId,
        );
        localStorage.setItem("campus-tracker-entries", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function addAnnouncement(announcement) {
    try {
      const createdAnnouncement = await campusApi.createAnnouncement(announcement);
      setApiNotice("");
      setAnnouncements((currentAnnouncements) => {
        const updatedAnnouncements = [createdAnnouncement, ...currentAnnouncements];
        localStorage.setItem(
          "campus-announcements",
          JSON.stringify(updatedAnnouncements),
        );
        return updatedAnnouncements;
      });
      return createdAnnouncement;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function updateAnnouncement(announcementId, updates) {
    try {
      const updated = await campusApi.updateAnnouncement(announcementId, updates);
      setAnnouncements((current) => {
        const next = current.map((item) =>
          item.id === announcementId ? updated : item,
        );
        localStorage.setItem("campus-announcements", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
      return updated;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function deleteAnnouncement(announcementId) {
    try {
      await campusApi.deleteAnnouncement(announcementId);
      setAnnouncements((current) => {
        const next = current.filter((item) => item.id !== announcementId);
        localStorage.setItem("campus-announcements", JSON.stringify(next));
        return next;
      });
      setReadAnnouncementIds((current) => {
        const next = current.filter((id) => id !== announcementId);
        localStorage.setItem("campus-read-announcements", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function addEvent(event) {
    try {
      const created = await campusApi.createEvent(event);
      setEvents((current) => {
        const next = [...current, created].sort(
          (first, second) => new Date(first.startsAt) - new Date(second.startsAt),
        );
        localStorage.setItem("campus-events", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
      return created;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function updateEvent(eventId, updates) {
    try {
      const updated = await campusApi.updateEvent(eventId, updates);
      setEvents((current) => {
        const next = current
          .map((item) => (item.id === eventId ? updated : item))
          .sort(
            (first, second) => new Date(first.startsAt) - new Date(second.startsAt),
          );
        localStorage.setItem("campus-events", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
      return updated;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function deleteEvent(eventId) {
    try {
      await campusApi.deleteEvent(eventId);
      setEvents((current) => {
        const next = current.filter((item) => item.id !== eventId);
        localStorage.setItem("campus-events", JSON.stringify(next));
        return next;
      });
      setApiNotice("");
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function toggleBookmark(opportunityId) {
    const isBookmarked = bookmarks.includes(opportunityId);
    try {
      if (isBookmarked) {
        await campusApi.deleteBookmark(opportunityId);
      } else {
        await campusApi.createBookmark(opportunityId);
      }
      const updatedBookmarks = isBookmarked
        ? bookmarks.filter((id) => id !== opportunityId)
        : [...bookmarks, opportunityId];
      setBookmarks(updatedBookmarks);
      localStorage.setItem("campus-bookmarks", JSON.stringify(updatedBookmarks));
      setApiNotice("");
    } catch (error) {
      return reportMutationError(error);
    }
  }

  function saveTrackerEntries(entries) {
    setTrackerEntries(entries);
    localStorage.setItem("campus-tracker-entries", JSON.stringify(entries));
  }

  async function addTrackerEntry(entry) {
    try {
      const createdEntry = await campusApi.createApplication(entry);
      setApiNotice("");
      saveTrackerEntries([createdEntry, ...trackerEntries]);
      return createdEntry;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function updateTrackerEntry(entryId, updates) {
    try {
      const updatedEntry = await campusApi.updateApplication(entryId, updates);
      setApiNotice("");
      saveTrackerEntries(
        trackerEntries.map((entry) =>
          entry.id === entryId ? { ...entry, ...updatedEntry } : entry,
        ),
      );
      return updatedEntry;
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function deleteTrackerEntry(entryId) {
    try {
      await campusApi.deleteApplication(entryId);
      setApiNotice("");
      saveTrackerEntries(trackerEntries.filter((entry) => entry.id !== entryId));
    } catch (error) {
      return reportMutationError(error);
    }
  }

  async function toggleAnnouncementRead(announcementId) {
    const isRead = readAnnouncementIds.includes(announcementId);
    try {
      if (isRead) {
        await campusApi.markAnnouncementUnread(announcementId);
      } else {
        await campusApi.markAnnouncementRead(announcementId);
      }
      const updatedIds = isRead
        ? readAnnouncementIds.filter((id) => id !== announcementId)
        : [...readAnnouncementIds, announcementId];
      setReadAnnouncementIds(updatedIds);
      localStorage.setItem(
        "campus-read-announcements",
        JSON.stringify(updatedIds),
      );
      setApiNotice("");
    } catch (error) {
      return reportMutationError(error);
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
    } catch (error) {
      return reportMutationError(error);
    }
  }

  const unreadAnnouncementCount = announcements.filter(
    (announcement) => !readAnnouncementIds.includes(announcement.id),
  ).length;
  const studentOpportunities = useMemo(
    () => deriveStudentOpportunities(opportunities, student, trackerEntries),
    [opportunities, student, trackerEntries],
  );

  const value = {
      currentUser,
      currentRole,
      opportunities:
        currentRole === "student" ? studentOpportunities : opportunities,
      announcements,
      events,
      bookmarks,
      trackerEntries,
      adminApplications,
      readAnnouncementIds,
      unreadAnnouncementCount,
      apiNotice,
      isInitialLoading,
      isAuthLoading,
      student,
      login,
      logout,
      addOpportunity,
      updateOpportunity,
      deleteOpportunity,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleBookmark,
      addTrackerEntry,
      updateTrackerEntry,
      deleteTrackerEntry,
      toggleAnnouncementRead,
      updateStudentProfile,
      clearApiNotice: () => setApiNotice(""),
  };

  return (
    <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
