import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "../../styles/full-site/baseterminal.css";

const DraggableTerminal = ({ children }) => {
  const nodeRef = useRef(null);

  const [command, setCommand] = useState("");
  const [executedCommand, setExecutedCommand] = useState(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setExecutedCommand(command); 
      setCommand(""); 
    }
  };

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
            <div className="terminal-output">
              <div> hi </div>
              {children}
            </div>
            <div className="prompt">
                ~/ryan-dong/site: 
                <input 
                className="command" 
                type="text" 
                placeholder="ls ./"
                value = {command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                />
            </div>
          </div>
        </div>
        
        </Draggable>
    </ResizableBox>
    
  );
};

export default DraggableTerminal;