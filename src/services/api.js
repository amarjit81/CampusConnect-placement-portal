const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:8080/api";
const AUTH_TOKEN_KEY = "campus-auth-token";

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, isNetworkError = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getAuthToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("The CampusConnect API is unavailable.", {
      isNetworkError: true,
    });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") {
      setAuthToken(null);
      window.dispatchEvent(new Event("campus-auth-expired"));
    }
    throw new ApiError(
      data?.message || `API request failed (${response.status})`,
      { status: response.status, data },
    );
  }

  return data;
}

export const campusApi = {
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  getCurrentUser: () => request("/auth/me"),
  getOpportunities: () => request("/opportunities"),
  createOpportunity: (opportunity) =>
    request("/opportunities", {
      method: "POST",
      body: JSON.stringify(opportunity),
    }),
  updateOpportunity: (opportunityId, updates) =>
    request(`/opportunities/${opportunityId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  deleteOpportunity: (opportunityId) =>
    request(`/opportunities/${opportunityId}`, { method: "DELETE" }),
  getAnnouncements: () => request("/announcements"),
  createAnnouncement: (announcement) =>
    request("/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    }),
  updateAnnouncement: (announcementId, updates) =>
    request(`/announcements/${announcementId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  deleteAnnouncement: (announcementId) =>
    request(`/announcements/${announcementId}`, { method: "DELETE" }),
  getEvents: () => request("/events"),
  createEvent: (event) =>
    request("/events", { method: "POST", body: JSON.stringify(event) }),
  updateEvent: (eventId, updates) =>
    request(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  deleteEvent: (eventId) =>
    request(`/events/${eventId}`, { method: "DELETE" }),
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

