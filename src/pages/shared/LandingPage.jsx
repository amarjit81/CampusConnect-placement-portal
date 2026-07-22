import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="brand brand--dark">
          <span className="brand__mark">CC</span>
          <div>
            <strong>CampusConnect</strong>
            <small>Placement portal</small>
          </div>
        </div>
        <Link className="button button--light" to="/login">
          Sign in
        </Link>
      </header>

      <main className="hero">
        <section className="hero__content">
          <span className="hero__tag">One campus. Every opportunity.</span>
          <h1>Placement information that students won’t miss.</h1>
          <p>
            CampusConnect gives your T&P Cell one clear place to publish
            opportunities, eligibility rules, deadlines, and announcements.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary button--large" to="/login">
              Open CampusConnect
            </Link>
            <a className="button button--text button--large" href="#features">
              See what is included ↓
            </a>
          </div>
          <div className="hero__trust">
            <span>✓ Clear eligibility</span>
            <span>✓ Deadline tracking</span>
            <span>✓ Central announcements</span>
          </div>
        </section>

        <section className="hero__visual" aria-label="Dashboard preview">
          <div className="preview-card preview-card--main">
            <div className="preview-card__top">
              <span>Placement overview</span>
              <span className="preview-dot" />
            </div>
            <strong>Good morning, Aarav</strong>
            <p>You have 2 eligible opportunities this week.</p>
            <div className="preview-stats">
              <span><b>3</b> Active</span>
              <span><b>2</b> Eligible</span>
              <span><b>2</b> Saved</span>
            </div>
          </div>
          <div className="preview-card preview-card--floating">
            <span className="company-logo">T</span>
            <div>
              <small>New opportunity</small>
              <strong>TechNova</strong>
              <span className="eligibility-badge eligibility-badge--eligible">
                Eligible
              </span>
            </div>
          </div>
        </section>
      </main>

      <section className="feature-section" id="features">
        <div className="feature-section__heading">
          <p className="eyebrow">Built for placement season</p>
          <h2>Simple tools for both sides of the campus</h2>
        </div>
        <div className="feature-grid">
          <article>
            <span>01</span>
            <h3>For the T&P Cell</h3>
            <p>Post complete opportunities and keep announcements organized.</p>
          </article>
          <article>
            <span>02</span>
            <h3>For students</h3>
            <p>See eligibility, upcoming deadlines, and saved roles at a glance.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Built to grow</h3>
            <p>Built on an authenticated Express, MongoDB, and JWT backend.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
