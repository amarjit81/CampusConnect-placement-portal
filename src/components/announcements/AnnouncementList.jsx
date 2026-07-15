import AnnouncementCard from "./AnnouncementCard";

function AnnouncementList({ announcements }) {
  return (
    <div className="announcement-list">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
        />
      ))}
    </div>
  );
}

export default AnnouncementList;
