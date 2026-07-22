import AnnouncementCard from "./AnnouncementCard";

function AnnouncementList({ announcements, onEdit, onDelete, deletingId }) {
  return (
    <div className="announcement-list">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === announcement.id}
        />
      ))}
    </div>
  );
}

export default AnnouncementList;
