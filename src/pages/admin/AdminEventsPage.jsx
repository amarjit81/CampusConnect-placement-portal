import { useState } from "react";
import { useCampus } from "../../context/CampusContext";

const emptyEvent = {
  title: "",
  description: "",
  eventType: "placement-drive",
  company: "",
  role: "",
  status: "scheduled",
  startsAt: "",
  endsAt: "",
  location: "",
  audience: "students",
  registrationLink: "",
};

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function AdminEventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useCampus();
  const [form, setForm] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (editingId) await updateEvent(editingId, payload);
      else await addEvent(payload);
      setEditingId(null);
      setForm(emptyEvent);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(item) {
    setEditingId(item.id);
    setForm({
      ...emptyEvent,
      ...item,
      title: item.title || item.eventTitle,
      description: item.description || item.notes,
      eventType: item.eventTypeCode || "other",
      status: item.statusCode || "scheduled",
      startsAt: toLocalInput(item.startsAt || item.dateTime),
      endsAt: toLocalInput(item.endsAt),
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeEvent(item) {
    if (!window.confirm(`Delete event “${item.title || item.eventTitle}”?`)) return;
    setDeletingId(item.id);
    try {
      await deleteEvent(item.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Placement calendar</p>
          <h2>Manage events</h2>
          <p>Create and maintain assessments, interviews, drives, and deadlines.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit event" : "Schedule an event"}</h3>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-grid">
          <label>Title<input name="title" value={form.title} onChange={updateField} required /></label>
          <label>Type<select name="eventType" value={form.eventType} onChange={updateField}>
            <option value="placement-drive">Placement drive</option>
            <option value="pre-placement-talk">Pre-placement talk</option>
            <option value="online-assessment">Online assessment</option>
            <option value="interview">Interview</option>
            <option value="workshop">Workshop</option>
            <option value="deadline">Deadline</option>
            <option value="company-activity">Company activity</option>
            <option value="other">Other</option>
          </select></label>
          <label>Company<input name="company" value={form.company} onChange={updateField} /></label>
          <label>Role<input name="role" value={form.role} onChange={updateField} /></label>
          <label>Starts<input type="datetime-local" name="startsAt" value={form.startsAt} onChange={updateField} required /></label>
          <label>Ends<input type="datetime-local" name="endsAt" value={form.endsAt} onChange={updateField} required /></label>
          <label>Location<input name="location" value={form.location} onChange={updateField} required /></label>
          <label>Status<select name="status" value={form.status} onChange={updateField}>
            <option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option>
            <option value="open">Open</option><option value="expected">Expected</option>
            <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select></label>
          <label>Audience<select name="audience" value={form.audience} onChange={updateField}>
            <option value="students">Students</option><option value="all">Everyone</option><option value="admins">Administrators</option>
          </select></label>
          <label>Registration URL<input type="url" name="registrationLink" value={form.registrationLink} onChange={updateField} placeholder="https://..." /></label>
          <label className="form-grid__full">Description<textarea name="description" value={form.description} onChange={updateField} rows="4" required /></label>
        </div>
        <div className="form-actions">
          <button className="button button--primary" disabled={isSaving}>{isSaving ? "Saving..." : editingId ? "Save changes" : "Schedule event"}</button>
          {editingId && <button className="button button--ghost" type="button" onClick={() => { setEditingId(null); setForm(emptyEvent); }}>Cancel</button>}
        </div>
      </form>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="eyebrow">Calendar</p><h2>All events</h2></div></div>
        <div className="tracker-list">
          {events.map((item) => (
            <article className="tracker-card" key={item.id}>
              <div className="tracker-card__header">
                <div><p>{item.company || "Campus event"}</p><h3>{item.title || item.eventTitle}</h3><small>{new Date(item.startsAt || item.dateTime).toLocaleString("en-IN")}</small></div>
                <div className="tracker-card__actions">
                  <button className="button button--ghost button--small" type="button" onClick={() => startEditing(item)}>Edit</button>
                  <button className="button button--danger button--small" type="button" disabled={deletingId === item.id} onClick={() => removeEvent(item)}>{deletingId === item.id ? "Deleting..." : "Delete"}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminEventsPage;
