// File: BodyTerminal.jsx
import React, { useState, useEffect } from "react";
import BlogOutput from "./GetBlogs";
import "../../styles/global.css";
import "../../styles/blogoutput.css";

function BodyTerminal({ inputCommand }) {
  // Declare states at the top of the component.
  const [searchInput, setSearchInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentWindow, setWindow] = useState(<div></div>);
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tag data only once when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tag = await fetch("/api/data?path=/tags").then((res) => res.json());
        console.log("Fetched Tag Data:", tag);

        if (Array.isArray(tag)) {
          setTagData(tag);
        } else {
          console.warn("Empty or invalid tag data:", tag);
        }
      } catch (error) {
        console.error("Error fetching from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // only runs on runtime

  // Update the currentWindow when the inputCommand changes.
  useEffect(() => {
    if (inputCommand === "ls ./") {
      setWindow(<BlogOutput searchInput={searchInput} selectedTags={selectedTags} />);
    } else {
      setWindow(<div> Do not recognize command</div>)
    }
  }, [inputCommand, searchInput, selectedTags]); // triggers on input command and selecting tags and searching

  const handleChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prevSelectedTags) => {
      if (tag === "reset") {
        return [];
      }
      return prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter((t) => t !== tag)
        : [...prevSelectedTags, tag];
    });
  };

  return (
    <div className="blog-page">
      {/* ---- Tabs (Acting as Tags) ---- */}
      <div className="tabs">
        {tagData.map((tag) => (
          <div
            key={tag}
            className={`tab ${selectedTags.includes(tag) ? "active" : ""}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </div>
        ))}
        <div className="tab reset" onClick={() => handleTagClick("reset")}>
          Reset
        </div>
      </div>

      {/* ---- Search Bar (Always Rendered) ---- */}
      {/* <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search here..."
          onChange={handleChange}
          value={searchInput}
          className="search-input"
        />
      </div> */}

      {/* ---- Conditionally Render the Blog Output ---- */}
      {currentWindow}
    </div>
  );
}

export default BodyTerminal;