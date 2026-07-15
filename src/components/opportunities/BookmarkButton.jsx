import { useCampus } from "../../context/CampusContext";

function BookmarkButton({ opportunityId, compact = false }) {
  const { bookmarks, toggleBookmark } = useCampus();
  const isBookmarked = bookmarks.includes(opportunityId);

  return (
    <button
      className={`bookmark-button ${isBookmarked ? "bookmark-button--saved" : ""}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleBookmark(opportunityId);
      }}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? "★" : "☆"}
      {!compact && <span>{isBookmarked ? "Saved" : "Save"}</span>}
    </button>
  );
}

export default BookmarkButton;
