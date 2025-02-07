import React, { useState } from 'react';

import BlogWindow from './BlogWindow.jsx';

export default function MultiWindowManager() {
  const [openWindows, setOpenWindows] = useState([]);

  function openBlogWindow(slug, commandString) {
    console.log('Full command typed:', commandString); 
    console.log('Opening post with slug:', slug);

    const newWin = {
      id: crypto.randomUUID(),
      type: 'blog',
      slug,
      command: commandString, 
    };
    setOpenWindows((prev) => [...prev, newWin]);
  }

  function closeWindow(id) {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div >
      <Terminal onOpenPost={openBlogWindow} />

      {openWindows.map((win) =>
        win.type === 'blog' ? (
          <BlogWindow
            key={win.id}
            slug={win.slug}
            onClose={() => closeWindow(win.id)}
          />
        ) : null
      )}
    </div>
  );
}