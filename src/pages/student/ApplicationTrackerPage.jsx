import { useState } from "react";
import { useCampus } from "../../context/CampusContext";
import EmptyState from "../../components/common/EmptyState";
import TrackerEntryModal from "../../components/tracker/TrackerEntryModal";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getStatusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function ApplicationTrackerPage() {
  const {
    trackerEntries,
    addTrackerEntry,
    updateTrackerEntry,
    deleteTrackerEntry,
  } = useCampus();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  function openAddModal() {
    setEditingEntry(null);
    setModalOpen(true);
  }

  function openEditModal(entry) {
    setEditingEntry(entry);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEntry(null);
  }

  async function saveEntry(entry) {
    setIsSaving(true);
    if (editingEntry) {
      await updateTrackerEntry(editingEntry.id, entry);
    } else {
      await addTrackerEntry(entry);
    }
    setIsSaving(false);
    closeModal();
  }

  async function removeEntry(entry) {
    if (
      window.confirm(
        `Remove ${entry.company} from your personal application tracker?`,
      )
    ) {
      setDeletingEntryId(entry.id);
      await deleteTrackerEntry(entry.id);
      setDeletingEntryId(null);
    }
  }

  return (
    <div className="page-stack tracker-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your personal workspace</p>
          <h2>Personal application tracker</h2>
          <p>
            Manage your personal placement applications, rounds, notes, and
            next steps.
          </p>
        </div>
        <div className="page-header__actions">
          <span className="tracker-count">
            {trackerEntries.length} application
            {trackerEntries.length !== 1 ? "s" : ""}
          </span>
          <button className="button button--primary" type="button" onClick={openAddModal}>
            + Add Tracking
          </button>
        </div>
      </div>

      {trackerEntries.length === 0 ? (
        <EmptyState
          title="Your tracker is empty"
          message="Add a company application to start managing its rounds and next steps."
        />
      ) : (
        <div className="tracker-list">
          {trackerEntries.map((application) => (
            <article className="tracker-card" key={application.id}>
              <div className="tracker-card__header">
                <div className="tracker-card__company">
                  <div>
                    <p>{application.company}</p>
                    <h3>{application.role}</h3>
                    <small>Applied {formatDate(application.appliedDate)}</small>
                  </div>
                </div>
                <div className="tracker-card__header-actions">
                  <strong
                    className={`application-status application-status--${getStatusClass(
                      application.applicationStatus,
                    )}`}
                  >
                    {application.applicationStatus}
                  </strong>
                  <div className="tracker-card__actions">
                    <button
                      className="button button--ghost button--small"
                      type="button"
                      onClick={() => openEditModal(application)}
                    >
                      Edit
                    </button>
                    {application.applicationStatus === "Rejected" && (
                      <button
                        className="button button--danger button--small"
                        type="button"
                        disabled={deletingEntryId === application.id}
                        onClick={() => removeEntry(application)}
                      >
                        {deletingEntryId === application.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="tracker-card__progress">
                <div className="tracker-card__field">
                  <span>Current round</span>
                  <strong>{application.currentRound}</strong>
                </div>
                <div className="tracker-card__field">
                  <span>Next interview / step</span>
                  <strong>{application.nextStep}</strong>
                </div>
                <div className="tracker-card__field">
                  <span>Notes</span>
                  <strong>{application.notes || "No notes added yet."}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <TrackerEntryModal
          entry={editingEntry}
          onClose={closeModal}
          onSave={saveEntry}
          isSubmitting={isSaving}
        />
      )}
    </div>
  );
}

export default ApplicationTrackerPage;
