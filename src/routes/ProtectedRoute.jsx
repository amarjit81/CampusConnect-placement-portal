import { Navigate, Outlet } from "react-router-dom";
import { useCampus } from "../context/CampusContext";

function ProtectedRoute({ allowedRole }) {
  const { currentRole } = useCampus();

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== allowedRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
