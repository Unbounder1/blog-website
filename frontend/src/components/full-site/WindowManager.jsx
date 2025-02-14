import React, { useState } from 'react';

import BlogWindow from './BlogWindow.jsx';
import Terminal from './BaseTerminal.jsx';
import '../../styles/full-site/window.css'

export default function MultiWindowManager() {
  const [openWindows, setOpenWindows] = useState([]);
  const [topWindow, setTopWindow] = useState(null);

  function openBlogWindow(slug) {
    console.log('Opening post with slug:', slug);

    const newWin = {
      id: crypto.randomUUID(),
      type: 'blog',
      slug
    };

    setOpenWindows((prev) => [...prev, newWin]);
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
        <Terminal onOpenPost={openBlogWindow} />
      </div>

      {openWindows.map((win) =>
        win.type === "blog" ? (
          <div 
            key={win.id}
            onMouseDown={() => bringToFront(win.id)}
            style={{ 
              position: "relative",
              zIndex: win.id === topWindow ? 999 : 1 }}
          >
            <BlogWindow
              slug={win.slug}
              onClose={() => closeWindow(win.id)}
            />
          </div>
        ) : null
      )}
    </div>
  );
}