import EmptyState from "../common/EmptyState";
import OpportunityCard from "./OpportunityCard";

function OpportunityList({ opportunities }) {
  if (opportunities.length === 0) {
    return (
      <EmptyState
        title="No opportunities found"
        message="Try changing your search or filters."
      />
    );
  }

  return (
    <div className="opportunity-grid">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
        />
      ))}
    </div>
  );
}

export default OpportunityList;
