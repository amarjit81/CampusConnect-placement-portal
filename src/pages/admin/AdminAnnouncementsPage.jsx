import { useState } from "react";
import { useCampus } from "../../context/CampusContext";
import AnnouncementList from "../../components/announcements/AnnouncementList";

const emptyForm = {
  title: "",
  message: "",
  body: "",
  date: "",
  important: false,
  audience: "students",
  attachmentName: "",
  attachmentType: "",
  attachmentUrl: "",
};

function AdminAnnouncementsPage() {
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useCampus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (editingId) await updateAnnouncement(editingId, form);
      else await addAnnouncement(form);
      setForm(emptyForm);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(announcement) {
    setEditingId(announcement.id);
    setForm({
      ...emptyForm,
      ...announcement,
      date: announcement.date ? String(announcement.date).slice(0, 10) : "",
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeAnnouncement(announcement) {
    if (!window.confirm(`Delete announcement “${announcement.title}”?`)) return;
    setDeletingId(announcement.id);
    try {
      await deleteAnnouncement(announcement.id);
      if (editingId === announcement.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
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
          <p className="eyebrow">Campus communication</p>
          <h2>Announcements</h2>
          <p>Publish clear updates for students through the CampusConnect API.</p>
        </div>
      </div>

      <div className="two-column-layout">
        <form className="form-card form-card--compact" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit announcement" : "Post an announcement"}</h3>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="Announcement title"
              required
            />
          </label>
          <label>
            Message
            <textarea
              value={form.message}
              onChange={(event) =>
                setForm({ ...form, message: event.target.value })
              }
              placeholder="Write the update"
              rows="5"
              required
            />
          </label>
          <label>
            Full details
            <textarea
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              placeholder="Add complete instructions or context"
              rows="7"
              required
            />
          </label>
          <label>
            Audience
            <select
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: event.target.value })}
            >
              <option value="students">Students</option>
              <option value="all">Everyone</option>
              <option value="admins">Administrators</option>
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm({ ...form, date: event.target.value })
              }
              required
            />
          </label>
          <label>
            Attachment name (optional)
            <input
              value={form.attachmentName}
              onChange={(event) => setForm({ ...form, attachmentName: event.target.value })}
              placeholder="Interview schedule"
            />
          </label>
          <label>
            Attachment type (optional)
            <input
              value={form.attachmentType}
              onChange={(event) => setForm({ ...form, attachmentType: event.target.value })}
              placeholder="PDF"
            />
          </label>
          <label>
            Attachment URL (optional)
            <input
              type="url"
              value={form.attachmentUrl}
              onChange={(event) => setForm({ ...form, attachmentUrl: event.target.value })}
              placeholder="https://..."
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.important}
              onChange={(event) =>
                setForm({ ...form, important: event.target.checked })
              }
            />
            Mark as important
          </label>
          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Publish announcement"}
          </button>
          {editingId && (
            <button
              className="button button--ghost"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel editing
            </button>
          )}
        </form>

        <div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Published</p>
              <h2>All announcements</h2>
            </div>
          </div>
          <AnnouncementList
            announcements={announcements}
            onEdit={startEditing}
            onDelete={removeAnnouncement}
            deletingId={deletingId}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncementsPage;
