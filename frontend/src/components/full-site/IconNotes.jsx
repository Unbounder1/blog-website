import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";

function IconNotes({ onOpenPost, imageIcon, displayTitle }) {
  const [selected, setSelected] = useState(false);
  const iconRef = useRef(null);

  // Deselect the icon if user clicks outside of it.
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (iconRef.current) {
        setSelected(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  // On double-click, call the open callback.
  const handleDoubleClick = (e) => {
    console.log("CLICKED TWICE")
    onOpenPost(displayTitle, "notes");
  };

  return (
    <Rnd
      enableResizing={false}
      ref={iconRef}
      default={{
        x: 50,
        y: 50,
        width: 50,
        height: 50,
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        // Highlight styling when selected.
        border: selected ? "1px solid #4a90e2" : "none",
        backgroundColor: selected ? "rgba(74,144,226,0.3)" : "transparent",
        padding: "2px",
        borderRadius: "4px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <img
        className="notes-image"
        src={imageIcon}
        alt={displayTitle}
        style={{ width: "100%", height: "100%" }}
        draggable="false"
      />
      <div style={{ 
        display: "flex",
        justifyContent: "center",
        alignItems: "center", }}> 
          {displayTitle} 
      </div>
    </Rnd>
  );
}

export default IconNotes;