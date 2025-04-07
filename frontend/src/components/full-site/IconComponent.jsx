import { useRef } from "react";
import { Rnd } from "react-rnd";

function IconComponent({ onOpenPost, imageIcon, displayTitle, defaultX, defaultY }) {
  const iconRef = useRef(null);

  // On double-click, call the open callback.
  const handleDoubleClick = () => {
    console.log("CLICKED TWICE")
    onOpenPost(displayTitle, displayTitle);
  };

  return (
    <Rnd
      className="icon"
      enableResizing={false}
      ref={iconRef}
      default={{
        x: defaultX || 50,
        y: defaultY || 50,
        width: 50,
        height: 50,
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        padding: "2px",
        borderRadius: "4px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <img
        className="icon-image"
        src={imageIcon}
        alt={displayTitle}
        style={{ width: "100%", height: "100%" }}
        draggable="false"
      />
      <div className="icon-text">
        {displayTitle}
      </div>
    </Rnd>
  );
}

export default IconComponent;