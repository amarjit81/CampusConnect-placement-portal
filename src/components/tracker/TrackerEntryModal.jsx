import { useState } from "react";

const emptyEntry = {
  company: "",
  role: "",
  appliedDate: "",
  currentRound: "Application Review",
  applicationStatus: "In Progress",
  nextStep: "",
  notes: "",
};

const roundOptions = [
  "Application Review",
  "Online Assessment",
  "DSA Round 1",
  "DSA Round 2",
  "Technical Interview",
  "HR Round",
];

function TrackerEntryModal({ entry, onClose, onSave, isSubmitting = false }) {
  const [form, setForm] = useState(() =>
    entry ? { ...emptyEntry, ...entry } : emptyEntry,
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card tracker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracker-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-card__header">
          <div>
            <p className="eyebrow">Personal tracker</p>
            <h2 id="tracker-modal-title">
              {entry ? "Edit tracking entry" : "Add tracking entry"}
            </h2>
            <p>Keep your application progress and next action up to date.</p>
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="tracker-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Company name
              <input
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                placeholder="e.g. TechNova"
                required
              />
            </label>
            <label>
              Role
              <input
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                placeholder="e.g. Graduate Software Engineer"
                required
              />
            </label>
            <label>
              Applied date
              <input
                type="date"
                value={form.appliedDate}
                onChange={(event) =>
                  updateField("appliedDate", event.target.value)
                }
                required
              />
            </label>
            <label>
              Current round
              <input
                list="tracker-round-options"
                value={form.currentRound}
                onChange={(event) =>
                  updateField("currentRound", event.target.value)
                }
                required
              />
              <datalist id="tracker-round-options">
                {roundOptions.map((round) => (
                  <option key={round} value={round} />
                ))}
              </datalist>
            </label>
            <label>
              Application status
              <select
                value={form.applicationStatus}
                onChange={(event) =>
                  updateField("applicationStatus", event.target.value)
                }
              >
                <option>In Progress</option>
                <option>Accepted</option>
                <option>Rejected</option>
              </select>
            </label>
            <label>
              Next interview / step
              <input
                value={form.nextStep}
                onChange={(event) => updateField("nextStep", event.target.value)}
                placeholder="e.g. Interview on 24 Jun at 10:00 AM"
                required
              />
            </label>
            <label className="form-grid__full">
              Notes
              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Preparation notes, contacts, links, or reminders"
              />
            </label>
          </div>

          <div className="modal-card__actions">
            <button
              className="button button--ghost"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : entry
                  ? "Save changes"
                  : "Add tracking"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TrackerEntryModal;
