import { useState, useEffect } from 'react';

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
    openNewWindow("Terminal", "Terminal")

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
    } else if (type === 'resume') {

      fetch("resume.pdf").then((response) => {
        response.blob().then((blob) => {
        
            // Creating new object of PDF file
            const fileURL =
                window.URL.createObjectURL(blob);
                
            // Setting various property values
            let alink = document.createElement("a");
            alink.href = fileURL;
            alink.download = "ryan-dong-resume.pdf";
            alink.click();
        });
    });
      return; 
    }
  
    setOpenWindows((prev) => {
      let updatedWindows = [...prev];
  
      // Only allow one terminal open at a time
      if (type === 'Terminal') {
        const existingTerminal = prev.find(win => win.type === 'Terminal');
  
        if (existingTerminal) {
          closeWindow(existingTerminal.id);
          updatedWindows = prev.filter(win => win.id !== existingTerminal.id);
        }
      }
  
      const newWin = {
        id: crypto.randomUUID(),
        type: type,
        data
      };
  
      updatedWindows.push(newWin);
      setTopWindow(newWin.id);
      
      return updatedWindows;
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

      {/* Icons On The Desktop */}

      <IconComponent 
        className="terminal-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="terminalicon.webp" 
        displayTitle="Terminal"
        defaultX="197"
        defaultY="211"
      />

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

      <IconComponent 
        className="circuitscan-icon" 
        onOpenPost={openNewWindow} 
        imageIcon="circuitscanicon.webp" 
        displayTitle="CircuitScan"
        defaultX="1119"
        defaultY="150"
      />
      
      {openWindows.map((win) => {
        if ( win.type === 'Terminal'){
          return (
            <div 
            className="window" 
            key={win.id}
            onMouseDown={() => bringToFront(win.id)}
            style={{ position: "relative", zIndex: topWindow === "terminal" ? 999 : 1 }}
            >
              <Terminal 
                onOpenPost={openNewWindow}
                onClose={() => closeWindow(win.id)} />
            </div>
          )
        }
        else if (win.type === 'blog') {
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
        else if (win.type === 'CircuitScan') {
          return (
            <div 
              key={win.id}
              onMouseDown={() => bringToFront(win.id)}
              style={{ position: "relative", zIndex: win.id === topWindow ? 999 : 1 }}
            >
              <IframeWindow
                onClose={() => closeWindow(win.id)}
                slug="/demo/circuitscan"
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