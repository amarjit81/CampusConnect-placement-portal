import { useCampus } from "../../context/CampusContext";
import AnnouncementList from "../../components/announcements/AnnouncementList";
import { sortAnnouncementsNewest } from "../../utils/announcements";

function AnnouncementsPage() {
  const { announcements } = useCampus();
  const sortedAnnouncements = sortAnnouncementsNewest(announcements);

  return (
    <div className="page-stack announcements-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">T&P updates</p>
          <h2>Announcements</h2>
          <p>
            Official updates, shortlists, interview schedules, resources, and
            files from the T&amp;P Cell.
          </p>
        </div>
      </div>
      <AnnouncementList announcements={sortedAnnouncements} />
    </div>
  );
}

export default AnnouncementsPage;
