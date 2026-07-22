import { Navigate, Outlet } from "react-router-dom";
import { useCampus } from "../context/CampusContext";

function ProtectedRoute({ allowedRole }) {
  const { currentRole, isAuthLoading } = useCampus();

  if (isAuthLoading) {
    return <div className="route-loading">Checking your session…</div>;
  }

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== allowedRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
