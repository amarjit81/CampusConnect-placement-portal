import { Link } from "react-router-dom";

function NotFoundPage({ embedded = false }) {
  return (
    <div className={`not-found ${embedded ? "not-found--embedded" : ""}`}>
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="button button--primary" to="/">
        Return home
      </Link>
    </div>
  );
}

export default NotFoundPage;
