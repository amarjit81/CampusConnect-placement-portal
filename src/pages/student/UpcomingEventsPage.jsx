import { useCampus } from "../../context/CampusContext";
import EmptyState from "../../components/common/EmptyState";

function formatEventDate(dateTime) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateTime));
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function UpcomingEventsPage() {
  const { events: campusEvents, isInitialLoading } = useCampus();
  const events = [...campusEvents]
    .filter((event) => new Date(event.dateTime) >= new Date())
    .sort((first, second) => new Date(first.dateTime) - new Date(second.dateTime));

  return (
    <div className="page-stack events-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Official T&P calendar</p>
          <h2>Upcoming placement events</h2>
          <p>
            View the shared schedule for official assessments, interviews,
            deadlines, and company activities.
          </p>
        </div>
        <span className="tracker-count">
          {events.length} upcoming event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="event-list">
        {!isInitialLoading && events.length === 0 && (
          <EmptyState
            title="No upcoming events"
            message="New placement events will appear here when the T&P Cell schedules them."
          />
        )}
        {events.map((event) => (
          <article className="event-card" key={event.id}>
            <div className="event-card__topline">
              <span className="official-label">Official Event</span>
              <span>Updated by T&amp;P</span>
            </div>
            <div className="event-card__body">
              <time className="event-card__date" dateTime={event.dateTime}>
                <span>Date and time</span>
                <strong>{formatEventDate(event.dateTime)}</strong>
              </time>

              <div className="event-card__company">
                <span className="company-logo">{event.company?.charAt(0) || "C"}</span>
                <div>
                  <p>{event.company || "Campus event"}</p>
                  <h3>{event.eventTitle || event.eventType}</h3>
                  <span>{event.role}</span>
                </div>
              </div>

              <div className="event-card__classification">
                <span>{event.eventType}</span>
                <strong
                  className={`event-status event-status--${getStatusClass(event.status)}`}
                >
                  {event.status}
                </strong>
              </div>

              <div className="event-card__notes">
                <span>Official note from T&amp;P</span>
                <p>{event.notes || event.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default UpcomingEventsPage;
