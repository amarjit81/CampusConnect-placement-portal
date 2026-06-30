import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import OpportunityList from "../../components/opportunities/OpportunityList";
import {
  isEligible,
  isNotApplied,
  isNotEligible,
} from "../../utils/opportunityStatus";

function OpportunitiesPage() {
  const { opportunities, currentRole } = useCampus();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companySearch, setCompanySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const filter = searchParams.get("filter") || "all";

  const filteredOpportunities = useMemo(() => {
    const matchingOpportunities = opportunities.filter((opportunity) => {
      const matchesCompany = opportunity.company
        .toLowerCase()
        .includes(companySearch.toLowerCase());
      const matchesRole = opportunity.role
        .toLowerCase()
        .includes(roleSearch.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        opportunity.status === filter ||
        (filter === "eligible" && isEligible(opportunity)) ||
        (filter === "not-applied" && isNotApplied(opportunity)) ||
        (filter === "not-eligible" && isNotEligible(opportunity));
      return (
        matchesCompany &&
        matchesRole &&
        (currentRole === "admin"
          ? filter === "all" || opportunity.status === filter
          : matchesFilter)
      );
    });

    return matchingOpportunities;
  }, [opportunities, companySearch, roleSearch, filter, currentRole]);

  function handleFilterChange(event) {
    const nextFilter = event.target.value;
    if (nextFilter === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ filter: nextFilter });
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {currentRole === "admin" ? "Manage postings" : "Explore roles"}
          </p>
          <h2>Placement opportunities</h2>
          <p>
            {currentRole === "admin"
              ? "Review current postings or publish a new opportunity."
              : "Find roles, review eligibility, and save the ones that matter."}
          </p>
        </div>
        {currentRole === "admin" && (
          <Link className="button button--primary" to="/admin/opportunities/new">
            + Add opportunity
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={companySearch}
            onChange={(event) => setCompanySearch(event.target.value)}
            placeholder="Search by company"
          />
        </label>
        <label className="search-box">
          <span>⌕</span>
          <input
            value={roleSearch}
            onChange={(event) => setRoleSearch(event.target.value)}
            placeholder="Search by role"
          />
        </label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">All opportunities</option>
          {currentRole === "student" && (
            <>
              <option value="eligible">Eligible</option>
              <option value="not-applied">Not Applied</option>
              <option value="not-eligible">Not Eligible</option>
            </>
          )}
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <span className="result-count">
          {filteredOpportunities.length} result
          {filteredOpportunities.length !== 1 ? "s" : ""}
        </span>
      </div>

      <OpportunityList opportunities={filteredOpportunities} />
    </div>
  );
}

export default OpportunitiesPage;
