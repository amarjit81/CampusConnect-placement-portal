function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <span>◇</span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
