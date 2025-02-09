import React, { useState, useEffect } from "react";
import BlogOutput from "./GetBlogs";
import "../../styles/global.css";
import "../../styles/full-site/blogoutput.css";

function BodyTerminal({ inputCommand }) {
  const [searchInput, setSearchInput] = useState("");
  const [currentWindow, setWindow] = useState(<div></div>);
  const [loading, setLoading] = useState(true);

  // State for managing tags
  const [allTags, setAllTags] = useState([]); // Full list of tags
  const [selectedTags, setSelectedTags] = useState([]); // Selected (visible) tags
  const [showPlusPanel, setShowPlusPanel] = useState(false); // Toggle available tags

  // Fetch tags once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tags = await fetch("/api/data?path=/tags").then((res) =>
          res.json()
        );
        console.log("Fetched Tag Data:", tags);

        if (Array.isArray(tags)) {
          setAllTags(tags);
        } else {
          console.warn("Invalid tag data:", tags);
        }
      } catch (error) {
        console.error("Error fetching from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute available (unselected) tags
  const availableTags = allTags.filter((tag) => !selectedTags.includes(tag));

  // Toggle tag selection/deselection
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag)); // Remove from selected
    } else {
      setSelectedTags((prev) => [...prev, tag]); // Add to selected
    }
  };

  // Toggle the plus panel inline
  const togglePlusPanel = () => {
    setShowPlusPanel((prev) => !prev);
  };

  // Update blog output when command or selected tags change
  // UPDATE AVAILABLE COMMANDS HERE --------------------------------------
  useEffect(() => {
    if (inputCommand === "ls ./") {
      setWindow(
        <BlogOutput searchInput={searchInput} selectedTags={selectedTags} />
      );
    } else if (inputCommand === "") { 
      setWindow(<div></div>);
    } else {
      setWindow(<div>Do not recognize command</div>);
    }
  }, [inputCommand, searchInput, selectedTags]);

  return (
    <div className="blog-page">
      {/* ---- Tags Section ---- */}
      <div className="tabs-container">
        <div className="tabs">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className={`tab ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </div>
          ))}

          {/* Plus button with inline expanding panel */}
          {availableTags.length > 0 && (
            <div className="plus-wrapper">
              <div className="tab add-tab" onClick={togglePlusPanel}>
                +
              </div>

              {/* Inline expanding available tags */}
              {showPlusPanel && (
                <div className="inline-plus-panel">
                  {availableTags.map((tag) => (
                    <div
                      key={tag}
                      className="tab"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Blog Output ---- */}
      {currentWindow}
    </div>
  );
}

export default BodyTerminal;