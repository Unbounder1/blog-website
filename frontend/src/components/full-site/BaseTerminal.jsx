import React, { useState } from "react";
import { Rnd } from "react-rnd";
import BodyTerminal from "./BodyTerminal.jsx";
import "../../styles/full-site/baseterminal.css";
import "../../styles/full-site/blogoutput.css";

const Terminal = ({ onOpenPost }) => {
  const [command, setCommand] = useState(""); 
  const [inputCommand, setInputCommand] = useState(""); 

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      
      const sanitizedCommand = command.split("#")[0].trim();
      setInputCommand(sanitizedCommand);
      setCommand(""); 
    }
  };

  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: 930,
        height: 660,
      }}
      minWidth={100}
      minHeight={100}
      dragHandleClassName="tabs"
    >
      <div className="terminal">
        
        {/* Terminal Body */}
        <div className="terminal-body">
          <div className="terminal-output">
            <BodyTerminal inputCommand={inputCommand} onOpenPost={onOpenPost} />
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
    </Rnd>
  );
};

export default Terminal;