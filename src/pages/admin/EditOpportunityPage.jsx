import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import OpportunityForm from "../../components/opportunities/OpportunityForm";
import { useCampus } from "../../context/CampusContext";

function EditOpportunityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunities, updateOpportunity } = useCampus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const opportunity = opportunities.find((item) => item.id === id);

  if (!opportunity) return <Navigate to="/admin/opportunities" replace />;

  async function handleSubmit(updates) {
    setIsSubmitting(true);
    setError("");
    try {
      await updateOpportunity(id, updates);
      navigate(`/admin/opportunities/${id}`);
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack page-stack--narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Manage posting</p>
          <h2>Edit opportunity</h2>
          <p>Update the role, eligibility, deadline, or publication status.</p>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <OpportunityForm
        initialValues={opportunity}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default EditOpportunityPage;
