import { useCampus } from "../../context/CampusContext";
import OpportunityList from "../../components/opportunities/OpportunityList";

function BookmarksPage() {
  const { opportunities, bookmarks } = useCampus();
  const bookmarkedOpportunities = opportunities.filter((opportunity) =>
    bookmarks.includes(opportunity.id),
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h2>Bookmarked opportunities</h2>
          <p>Keep the roles you want to revisit in one place.</p>
        </div>
      </div>
      <OpportunityList opportunities={bookmarkedOpportunities} />
    </div>
  );
}

export default BookmarksPage;
