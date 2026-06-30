import { useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import OpportunityForm from "../../components/opportunities/OpportunityForm";

function AddOpportunityPage() {
  const { addOpportunity } = useCampus();
  const navigate = useNavigate();

  function handleSubmit(opportunity) {
    addOpportunity(opportunity);
    navigate("/admin/opportunities");
  }

  return (
    <div className="page-stack page-stack--narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">New posting</p>
          <h2>Add an opportunity</h2>
          <p>
            Enter the company, role, deadline, and eligibility requirements.
          </p>
        </div>
      </div>
      <OpportunityForm onSubmit={handleSubmit} />
    </div>
  );
}

export default AddOpportunityPage;
