import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import '../../styles/full-site/page.css';

// ensure localstorage reset on reload
if (typeof window !== 'undefined') {
    localStorage.removeItem("notepadText");
}

export default function NotesWindow({ onClose }) {
  const iframeRef = useRef(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 660, height: 1000 });
  const [position, setPosition] = useState({ x: 50, y: 50 }); // starting position

  // Store original size/position for restore
  const originalSettings = useRef({ size, position });

  // Set up the notepad content state --- SET NOTEPAD STUFF HERE
  const [noteText, setNoteText] = useState(() => {
    return localStorage.getItem('notepadText') ||
`Welcome to my Blog! 

Available Commands:

ls ./ # lists all projects, navigate with up/down arrows
rm -rf # load back to default screen

Links:

Double click on icons to open/download contents

`;
  });

  // Saves notepad on change
  useEffect(() => {
    localStorage.setItem('notepadText', noteText);
  }, [noteText]);

  const handleDragStart = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = 'none';
    }
  }, []);

  const handleDragStop = useCallback((e, d) => {
    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = 'auto';
    }
    setPosition({ x: d.x, y: d.y });
  }, []);

  const handleResizeStop = useCallback((e, direction, ref, delta, pos) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPosition(pos);
  }, []);

  const toggleMaximize = useCallback(() => {
    if (!isMaximized) {
      // Save current size/position before maximizing
      originalSettings.current = { size, position };
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    } else {
      setSize(originalSettings.current.size);
      setPosition(originalSettings.current.position);
    }
    setIsMaximized(prev => !prev);
  }, [isMaximized, size, position]);

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="window"
      dragHandleClassName="notes-window-header"
      style={{ zIndex: 1000, willChange: 'transform' }} // performance hint
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        {/* Header with drag handle, maximize/restore, and close buttons */}
        <div
          className="notes-window-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ddd',
            padding: '5px',
            cursor: 'move',
          }}
        >
          <span>Notepad</span>
          <div>
            <button onClick={toggleMaximize}>
                {isMaximized ? '❐' : '□'}
            </button>
            <button className="window-close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>
        {/* Text area that fills the rest of the window */}
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            outline: 'none',
            resize: 'none',
          }}
        />
      </div>
    </Rnd>
  );
}