const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `API request failed (${response.status})`);
  }

  return data;
}

export const campusApi = {
  getOpportunities: () => request("/opportunities"),
  createOpportunity: (opportunity) =>
    request("/opportunities", {
      method: "POST",
      body: JSON.stringify(opportunity),
    }),
  getAnnouncements: () => request("/announcements"),
  createAnnouncement: (announcement) =>
    request("/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    }),
  getEvents: () => request("/events"),
  getBookmarks: () => request("/bookmarks"),
  createBookmark: (opportunityId) =>
    request(`/bookmarks/${opportunityId}`, { method: "POST" }),
  deleteBookmark: (opportunityId) =>
    request(`/bookmarks/${opportunityId}`, { method: "DELETE" }),
  getApplications: () => request("/applications"),
  createApplication: (application) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify(application),
    }),
  updateApplication: (applicationId, updates) =>
    request(`/applications/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  deleteApplication: (applicationId) =>
    request(`/applications/${applicationId}`, { method: "DELETE" }),
  getProfile: () => request("/profile"),
  updateProfile: (profile) =>
    request("/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
  getReadAnnouncements: () => request("/announcement-reads"),
  markAnnouncementRead: (announcementId) =>
    request(`/announcement-reads/${announcementId}`, { method: "PUT" }),
  markAnnouncementUnread: (announcementId) =>
    request(`/announcement-reads/${announcementId}`, { method: "DELETE" }),
};

