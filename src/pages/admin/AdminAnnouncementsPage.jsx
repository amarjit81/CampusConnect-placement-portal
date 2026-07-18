import { useState } from "react";
import { useCampus } from "../../context/CampusContext";
import AnnouncementList from "../../components/announcements/AnnouncementList";

function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement } = useCampus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    date: "",
    important: false,
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    await addAnnouncement(form);
    setIsSubmitting(false);
    setForm({ title: "", message: "", date: "", important: false });
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
          <h3>Post an announcement</h3>
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
            {isSubmitting ? "Publishing..." : "Publish announcement"}
          </button>
        </form>

        <div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Published</p>
              <h2>All announcements</h2>
            </div>
          </div>
          <AnnouncementList announcements={announcements} />
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncementsPage;
