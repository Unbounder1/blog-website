import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import BodyTerminal from "./BodyTerminal.jsx";
import "../../styles/full-site/baseterminal.css";
import "../../styles/full-site/blogoutput.css";

const Terminal = ({ children }) => {
  const nodeRef = useRef(null);
  
  const [command, setCommand] = useState(""); // Current input command
  const [inputCommand, setInputCommand] = useState(""); // Command passed to BodyTerminal

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      
      let sanitizedCommand = command.split("#")[0].trim();
      
      // Instead of setting JSX, update the command state
      setInputCommand(sanitizedCommand);

      // Clear input field
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
          {/* Terminal Body */}
          <div className="terminal-body">
            <div className="terminal-output">
              <BodyTerminal inputCommand={inputCommand} />
            </div>
            <div className="prompt">
              ~/ryan-dong/site: 
              <input 
                className="command" 
                type="text" 
                placeholder="ls ./"
                value={command}
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

export default Terminal;