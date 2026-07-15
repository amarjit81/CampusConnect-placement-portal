import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import opportunityData from "../data/opportunities.json";
import announcementData from "../data/announcements.json";
import studentData from "../data/student.json";

const CampusContext = createContext();
const API_BASE_URL = "http://localhost:8080/api";

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
  const [apiNotice, setApiNotice] = useState("");

  useEffect(() => {
    let ignoreResponse = false;

    async function loadApiData() {
      try {
        const [opportunityResponse, announcementResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/opportunities`),
          fetch(`${API_BASE_URL}/announcements`),
        ]);

        if (!opportunityResponse.ok || !announcementResponse.ok) {
          throw new Error("Could not load campus data");
        }

        const [apiOpportunities, apiAnnouncements] = await Promise.all([
          opportunityResponse.json(),
          announcementResponse.json(),
        ]);

        if (!ignoreResponse) {
          setOpportunities(apiOpportunities);
          setAnnouncements(apiAnnouncements);
          localStorage.setItem(
            "campus-opportunities",
            JSON.stringify(apiOpportunities),
          );
          localStorage.setItem(
            "campus-announcements",
            JSON.stringify(apiAnnouncements),
          );
          setApiNotice("");
        }
      } catch {
        if (!ignoreResponse) {
          setApiNotice(
            "The API is unavailable. CampusConnect is using saved offline data.",
          );
        }
      }
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
      const response = await fetch(`${API_BASE_URL}/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(opportunity),
      });

      if (!response.ok) {
        throw new Error("Could not create opportunity");
      }

      const createdOpportunity = await response.json();

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
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(announcement),
      });

      if (!response.ok) {
        throw new Error("Could not create announcement");
      }

      createdAnnouncement = await response.json();
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
      apiNotice,
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
      clearApiNotice: () => setApiNotice(""),
    }),
    [
      currentRole,
      opportunities,
      announcements,
      bookmarks,
      trackerEntries,
      readAnnouncementIds,
      unreadAnnouncementCount,
      apiNotice,
    ],
  );

  return (
    <CampusContext.Provider value={value}>{children}</CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
