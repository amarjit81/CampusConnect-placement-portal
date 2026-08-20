import { useState } from "react";
import { useCampus } from "../../context/CampusContext";

function BookmarkButton({ opportunityId, compact = false }) {
  const { bookmarks, toggleBookmark } = useCampus();
  const [isUpdating, setIsUpdating] = useState(false);
  const isBookmarked = bookmarks.includes(opportunityId);

  return (
    <button
      className={`bookmark-button ${isBookmarked ? "bookmark-button--saved" : ""}`}
      type="button"
      disabled={isUpdating}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsUpdating(true);
        try {
          await toggleBookmark(opportunityId);
        } catch {
          // The shared API notice displays the server error.
        } finally {
          setIsUpdating(false);
        }
      }}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? "★" : "☆"}
      {!compact && <span>{isBookmarked ? "Saved" : "Save"}</span>}
    </button>
  );
}

export default BookmarkButton;
