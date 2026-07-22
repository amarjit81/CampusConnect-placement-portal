import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCampus } from "../../context/CampusContext";

const demoAccounts = {
  student: {
    email: "student@campusconnect.edu",
    password: "Student@123",
  },
  admin: {
    email: "admin@campusconnect.edu",
    password: "Admin@123",
  },
};

function LoginPage() {
  const { currentRole, isAuthLoading, login } = useCampus();
  const [credentials, setCredentials] = useState(demoAccounts.student);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (currentRole) {
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  }

  function updateField(event) {
    setCredentials((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await login(credentials);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="eyebrow">Secure campus access</p>
          <h1>Your placement workspace starts here.</h1>
          <p>
            Sign in to access the tools and placement data available for your
            student or administrator account.
          </p>
        </div>
        <small>React + Express + MongoDB · JWT authentication</small>
      </section>

      <section className="login-panel login-panel--form">
        <form className="login-card login-form" onSubmit={handleLogin}>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in</h2>
          <p>Use your CampusConnect account credentials.</p>

          <div className="login-form__fields">
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={credentials.email}
                onChange={updateField}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={updateField}
                required
              />
            </label>
          </div>

          {error && <p className="login-form__error" role="alert">{error}</p>}

          <button
            className="button button--primary button--full button--large"
            type="submit"
            disabled={isSubmitting || isAuthLoading}
          >
            {isSubmitting ? "Signing in…" : "Sign in →"}
          </button>

          <div className="login-form__demo">
            <span>Demo accounts</span>
            <button type="button" onClick={() => setCredentials(demoAccounts.student)}>
              Student
            </button>
            <button type="button" onClick={() => setCredentials(demoAccounts.admin)}>
              Administrator
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
