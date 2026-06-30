import { Link } from "react-router-dom";

function StatCard({ label, value, helper, tone = "blue", actionLabel, to }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <strong className="stat-card__value">{value}</strong>
        <p className="stat-card__helper">{helper}</p>
      </div>
      {actionLabel && to && (
        <Link className="button button--ghost button--small stat-card__action" to={to}>
          <span>{actionLabel}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  );
}

export default StatCard;
