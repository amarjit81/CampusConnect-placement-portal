import { useState } from "react";
import { useCampus } from "../../context/CampusContext";
import {
  formatAnnouncementDate,
  formatAnnouncementDateTime,
  getRelativeTime,
} from "../../utils/announcements";

function AnnouncementCard({ announcement }) {
  const {
    currentRole,
    readAnnouncementIds,
    toggleAnnouncementRead,
  } = useCampus();
  const [showFullAnnouncement, setShowFullAnnouncement] = useState(false);
  const isStudent = currentRole === "student";
  const isRead = readAnnouncementIds.includes(announcement.id);

  return (
    <>
      <article
        className={`announcement-card ${
          announcement.important ? "announcement-card--important" : ""
        } ${isStudent && isRead ? "announcement-card--read" : ""}`}
      >
        <div className="announcement-card__icon" aria-hidden="true">
          {announcement.important ? "!" : "i"}
        </div>
        <div className="announcement-card__content">
          <div className="announcement-card__meta">
            <span>{formatAnnouncementDate(announcement.date)}</span>
            <span className="announcement-card__separator" aria-hidden="true" />
            <span>{getRelativeTime(announcement.date)}</span>
            {announcement.important && (
              <strong className="announcement-card__badge">Important</strong>
            )}
            {isStudent && isRead && (
              <strong className="announcement-card__read-label">Read</strong>
            )}
          </div>
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
          {isStudent && (
            <div className="announcement-card__actions">
              <button
                className="announcement-read-toggle"
                type="button"
                aria-pressed={isRead}
                onClick={() => toggleAnnouncementRead(announcement.id)}
              >
                <span className="announcement-read-toggle__control">
                  {isRead ? "✓" : ""}
                </span>
                {isRead ? "Marked as read" : "Mark as read"}
              </button>
              <button
                className="button button--ghost button--small announcement-card__open"
                type="button"
                onClick={() => setShowFullAnnouncement(true)}
              >
                Read full announcement
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
      </article>

      {showFullAnnouncement && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowFullAnnouncement(false)}
        >
          <section
            className="modal-card announcement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`announcement-title-${announcement.id}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-card__header">
              <div>
                <div className="announcement-modal__meta">
                  <span>{formatAnnouncementDateTime(announcement.date)}</span>
                  <span>{getRelativeTime(announcement.date)}</span>
                  {announcement.important && (
                    <strong className="announcement-card__badge">
                      Important
                    </strong>
                  )}
                </div>
                <h2 id={`announcement-title-${announcement.id}`}>
                  {announcement.title}
                </h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setShowFullAnnouncement(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="announcement-modal__body">
              <p>{announcement.body || announcement.message}</p>
              {announcement.attachmentName && (
                <div className="attachment-card">
                  <div className="attachment-card__icon" aria-hidden="true">
                    {announcement.attachmentType || "File"}
                  </div>
                  <div>
                    <span>Attached file</span>
                    <strong>{announcement.attachmentName}</strong>
                  </div>
                  <a
                    className="button button--ghost button--small"
                    href={announcement.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open attachment
                  </a>
                </div>
              )}
            </div>

            <div className="modal-card__actions">
              <button
                className={`button ${
                  isRead ? "button--ghost" : "button--primary"
                }`}
                type="button"
                onClick={() => toggleAnnouncementRead(announcement.id)}
              >
                {isRead ? "Mark as unread" : "✓ Mark as read"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default AnnouncementCard;
