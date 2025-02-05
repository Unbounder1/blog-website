import React, { useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "../../styles/full-site/baseterminal.css";

const DraggableTerminal = () => {
  const nodeRef = useRef(null);

  useEffect(() => {
    console.log("Component mounted and hydrated.");
  }, []);

  return (
    <ResizableBox
        width={200}
        height={200}
        minConstraints={[100, 100]}
        maxConstraints={[500, 500]}
        axis="both"
      >
        <Draggable nodeRef={nodeRef} handle=".tabs">
      
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
    </ResizableBox>
    
  );
};

export default DraggableTerminal;