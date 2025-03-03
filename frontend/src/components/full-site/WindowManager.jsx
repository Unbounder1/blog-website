import React, { useState, useEffect } from 'react';

import BlogWindow from './BlogWindow.jsx';
import Terminal from './BaseTerminal.jsx';
import NotesWindow from './NoteWindow.jsx';
import IconComponent from './IconComponent.jsx';
import IframeWindow from './IframeWindow.jsx';

import '../../styles/full-site/window.css'

export default function MultiWindowManager() {
  const [openWindows, setOpenWindows] = useState([]);
  const [topWindow, setTopWindow] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false); // load full image after rest of stuff

  useEffect(() => { // on startup
    
    openNewWindow("Notes", "Notes")

    if (document.readyState === "complete") {
      setImageLoaded(true);
    } else {
      const handleLoad = () => setImageLoaded(true);
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }

  }, []);

  function openNewWindow(data, type) {

    if (type === 'Github') {
      window.open('https://github.com/Unbounder1', '_blank');
      return; 
    } else if (type === 'LinkedIn') {
      window.open('https://www.linkedin.com/in/ryan-dong-81175422a', '_blank');
      return; 
    }
  
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
    <div className="window-simple-wallpaper">
    <div 
      className="window-container"
      style={{ backgroundImage: imageLoaded ? 'url("/wallpaper.webp")' : "none" }}
      >
      <div 
        className="window" 
        onMouseDown={() => bringToFront("terminal")}
        style={{ 
          position: "relative",
          zIndex: topWindow === "terminal" ? 999 : 1 }}
      >
        <Terminal onOpenPost={openNewWindow} />
      </div>

      {/* Icons On The Desktop */}
      <IconComponent 
        className="notes-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="noteicon.webp" 
        displayTitle="Notes"
        defaultX="123"
        defaultY="211"
      
      />
      <IconComponent 
        className="github-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="githubicon.webp" 
        displayTitle="Github"
        defaultX="122"
        defaultY="294"
      />

      <IconComponent 
        className="resume-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="noteicon.webp" 
        displayTitle="resume"
        defaultX="122"
        defaultY="376"
      />

      <IconComponent 
        className="linkedin-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="linkedinicon.webp" 
        displayTitle="LinkedIn"
        defaultX="197"
        defaultY="295"
      />
      
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
        } 
        else if (win.type === 'Notes') {
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
        } 
        else if (win.type === 'Github') {
        } 
        
        else {
          return null; // Fallback case (optional)
        }
      })}
    </div>
    </div>
  );
}