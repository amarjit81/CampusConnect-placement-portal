import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";

function LoginPage() {
  const { currentRole, login } = useCampus();
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();

  if (currentRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  function handleLogin() {
    login(selectedRole);
    navigate(`/${selectedRole}/dashboard`);
  }

  return (
    <div className="login-page">
      <section className="login-panel login-panel--intro">
        <div className="brand brand--dark">
          <span className="brand__mark">CC</span>
          <div>
            <strong>CampusConnect</strong>
            <small>Placement portal</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Frontend prototype</p>
          <h1>Your placement workspace starts here.</h1>
          <p>
            Choose a role to explore the complete Version 1 experience. No
            account or password is required.
          </p>
        </div>
        <small>React + Vite · Mock data · Local state</small>
      </section>

      <section className="login-panel login-panel--form">
        <div className="login-card">
          <p className="eyebrow">Demo access</p>
          <h2>Continue as</h2>
          <p>Select the workspace you want to preview.</p>

          <div className="role-options">
            <button
              className={`role-option ${
                selectedRole === "student" ? "role-option--active" : ""
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <span>A</span>
              <div>
                <strong>Student</strong>
                <small>Discover and save opportunities</small>
              </div>
              <b>✓</b>
            </button>
            <button
              className={`role-option ${
                selectedRole === "admin" ? "role-option--active" : ""
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              <span>TP</span>
              <div>
                <strong>T&P Administrator</strong>
                <small>Publish opportunities and updates</small>
              </div>
              <b>✓</b>
            </button>
          </div>

          <button
            className="button button--primary button--full button--large"
            onClick={handleLogin}
          >
            Enter {selectedRole} dashboard →
          </button>
          <p className="login-card__note">
            This is a mock login. Authentication will be added with JWT later.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
