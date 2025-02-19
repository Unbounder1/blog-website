import React, { useState } from 'react';

import BlogWindow from './BlogWindow.jsx';
import Terminal from './BaseTerminal.jsx';
import NotesWindow from './NoteWindow.jsx';
import IconNotes from './IconNotes.jsx';

import '../../styles/full-site/window.css'

function isFocused(winId, topWindow){
  if (win.id === topWindow) {
    return `
            <div className="unfocused-window"></div>
            <div 
              key={win.id}
              onMouseDown={() => bringToFront(win.id)}
              style={{ position: "relative", zIndex: win.id === topWindow ? 999 : 1 }}
            >`
  } else {
    `       <div 
              key={win.id}
              onMouseDown={() => bringToFront(win.id)}
              style={{ position: "relative", zIndex: win.id === topWindow ? 999 : 1 }}
            >`
  }
}

export default function MultiWindowManager() {
  const [openWindows, setOpenWindows] = useState([]);
  const [topWindow, setTopWindow] = useState(null);

  function openNewWindow(data, type) {

    const newWin = {
      id: crypto.randomUUID(),
      type: type,
      data
    };

    setOpenWindows((prev) => {
      const updated = [...prev, newWin];
      setTopWindow(newWin.id);
      return updated;
    });
  }
  
  const closeWindow = (id) => {
    setOpenWindows(openWindows.filter((win) => win.id !== id));
    if (topWindow === id) {
      setTopWindow(null); 
    }
  };

  const bringToFront = (id) => {
    setTopWindow(id);
  };

  return (
    <div className="window-container">
      <div 
        className="window" 
        onMouseDown={() => bringToFront("terminal")}
        style={{ 
          position: "relative",
          zIndex: topWindow === "terminal" ? 999 : 1 }}
      >
        <Terminal onOpenPost={openNewWindow} />
      </div>

      <IconNotes className="notes-icon" onOpenPost={openNewWindow} imageIcon="noteicon.png" displayTitle="Notes"/>

      {openWindows.map((win) => {
        if (win.type === 'blog') {
          return (
            <div 
              key={win.id}
              onMouseDown={() => bringToFront(win.id)}
              style={{ position: "relative", zIndex: win.id === topWindow ? 999 : 1 }}
            >
              <BlogWindow
                slug={win.data}
                onClose={() => closeWindow(win.id)}
              />
            </div>
          );
        } else if (win.type === 'notes') {
          return (
            <div 
              key={win.id}
              onMouseDown={() => bringToFront(win.id)}
              style={{ position: "relative", zIndex: win.id === topWindow ? 999 : 1 }}
            >
              <NotesWindow
                onClose={() => closeWindow(win.id)}
              />
            </div>
          );
        } else {
          return null; // Fallback case (optional)
        }
      })}
    </div>
  );
}