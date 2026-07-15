function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === "active" ? "Active" : "Closed"}
    </span>
  );
}

export default StatusBadge;
