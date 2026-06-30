function ApplicationBadge({ applied }) {
  return (
    <span
      className={`application-badge application-badge--${
        applied ? "applied" : "not-applied"
      }`}
    >
      {applied ? "Applied" : "Not Applied"}
    </span>
  );
}

export default ApplicationBadge;
