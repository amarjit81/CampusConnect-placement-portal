function parseAnnouncementDate(value) {
  return new Date(value.includes("T") ? value : `${value}T00:00:00`);
}

export function sortAnnouncementsNewest(announcements) {
  return [...announcements].sort(
    (first, second) =>
      parseAnnouncementDate(second.date) - parseAnnouncementDate(first.date),
  );
}

export function formatAnnouncementDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseAnnouncementDate(value));
}

export function formatAnnouncementDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parseAnnouncementDate(value));
}

export function getRelativeTime(value, now = new Date()) {
  const date = parseAnnouncementDate(value);
  const differenceMs = now - date;
  const isDateOnly = !value.includes("T");
  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  if (isDateOnly && isSameDay) {
    return "Today";
  }

  if (differenceMs < 0 || differenceMs < 60 * 1000) {
    return isSameDay ? "Today" : "Upcoming";
  }

  const minutes = Math.floor(differenceMs / (60 * 1000));
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}
