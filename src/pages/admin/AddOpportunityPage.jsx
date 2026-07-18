import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import OpportunityForm from "../../components/opportunities/OpportunityForm";

function AddOpportunityPage() {
  const { addOpportunity } = useCampus();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(opportunity) {
    setIsSubmitting(true);
    await addOpportunity(opportunity);
    setIsSubmitting(false);
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
      <OpportunityForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

export default AddOpportunityPage;
