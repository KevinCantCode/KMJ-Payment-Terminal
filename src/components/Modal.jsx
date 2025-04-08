import { useEffect, useState } from "react";
import "../styles/Modal.css";

function Modal({ isOpen, onClose, title, children, isEditing, onCancelEdit }) {
  // State to track if the modal is in the process of closing
  const [isClosing, setIsClosing] = useState(false);

  // Handle the closing animation
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actual close
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // Match animation duration
  };

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        // If in editing mode, cancel edit instead of closing modal
        if (isEditing && onCancelEdit) {
          onCancelEdit();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Restore scrolling when modal is closed
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, isEditing, onCancelEdit]);

  // Don't render anything if the modal is not open and not in the process of closing
  if (!isOpen && !isClosing) return null;

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Determine CSS classes based on opening/closing state
  const overlayClass = `modal-overlay ${isClosing ? "closing" : ""}`;
  const containerClass = `modal-container ${isClosing ? "closing" : ""}`;

  return (
    <div className={overlayClass} onClick={handleClose}>
      <div className={containerClass} onClick={handleModalClick}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={handleClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
