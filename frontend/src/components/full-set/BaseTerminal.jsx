import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import "../../styles/full-site/baseterminal.css";

const DraggableTerminal = () => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log("Component mounted and hydrated.");
  }, []);

  const handleDrag = (e, data) => {
    console.log("Dragging:", data);
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={(e, data) => console.log("Drag started", e, data)}
      onDrag={(e, data) => {
        console.log("Dragging", e, data);
        handleDrag(e, data);
      }}
      onStop={(e, data) => console.log("Drag stopped", e, data)}
    >
      <div ref={nodeRef} className="terminal">
        {/* Tabs */}
        <div className="tabs">
          <div className="tab active">SRE</div>
          <div className="tab">SWE</div>
          <div className="tab">Kubernetes</div>
          <div className="tab add-tab">+</div>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          <div className="prompt">
            ~/ryan-dong/site: <span className="command">ls ./portfolio</span>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableTerminal;