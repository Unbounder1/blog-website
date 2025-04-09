import { useRef, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import '../../styles/full-site/page.css';

export default function IframeWindow({ slug, onClose }) {
  const iframeRef = useRef(null);
  const href = `${slug}`;

  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 660, height: 800 });
  const [position, setPosition] = useState({ x: 50, y: 50 }); // starting position

  const [renderTick, setRenderTick] = useState(0);


  // Store original size/position for restore
  const originalSettings = useRef({ size, position });

  const handleDragStart = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.style.pointerEvents = "none";
    }
  }, []);

  const handleDragStop = useCallback((e, d) => {
    setPosition({ x: d.x, y: d.y });
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = "auto";
      }
    }, 0);
    setRenderTick((tick) => tick + 1);

  }, []);

  const handleResizeStop = useCallback((ref, pos) => {
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
      minWidth={500}
      minHeight={400}
      bounds="window"
      dragHandleClassName="blog-window-header"
      style={{ zIndex: 1000, willChange: 'transform' }} 
      
    >
      <div className="blog-window">
        {/* Browser-like Header */}
        <div className="blog-window-header">
          <div className="blog-window-tabs">
            <span className="blog-window-title"></span>
            <span className="blog-window-slug">{slug}</span>
          </div>
          <div className="blog-window-controls">
            <button className="window-maximize-btn" onClick={toggleMaximize}>
              {isMaximized ? '❐' : '□'}
            </button>
            <button className="window-close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="blog-window-content">
          <iframe
            style={{ width: '100%', height: '100%', border: 'none' }}
            ref={iframeRef}
            src={href}
            className="iframe"
            title={slug}
          />
        </div>
      </div>
    </Rnd>
  );
}