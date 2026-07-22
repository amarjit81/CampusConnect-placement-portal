import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";
import OpportunityForm from "../../components/opportunities/OpportunityForm";

function AddOpportunityPage() {
  const { addOpportunity } = useCampus();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(opportunity) {
    setIsSubmitting(true);
    setError("");
    try {
      await addOpportunity(opportunity);
      navigate("/admin/opportunities");
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
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
      {error && <p className="form-error" role="alert">{error}</p>}
      <OpportunityForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

export default AddOpportunityPage;
