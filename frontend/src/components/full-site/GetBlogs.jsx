import React, { useState, useEffect, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import "../../styles/global.css";
import "../../styles/full-site/blogoutput.css";

// Utility function to turn a post title into a URL-safe string
function slugify(text) {
  return text
    .toString()
    .normalize("NFD") // Normalize diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function BlogOutput({ searchInput, selectedTags, onOpenPost }) {
  const [digestData, setDigestData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track the index of the currently active (selected) post from the visible list.
  const [activeIndex, setActiveIndex] = useState(0);
  // useRef to focus the container so that arrow-key events are captured.
  const containerRef = useRef(null);

  // Fetch blog digest data when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const digest = await fetch("/api/data?path=/digest").then((res) =>
          res.json()
        );
        console.log("Fetched Digest Data:", digest);
        if (Array.isArray(digest)) {
          setDigestData(digest);
        } else {
          console.warn("Empty or invalid digest data:", digest);
        }
      } catch (error) {
        console.error("Error fetching from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run once on mount

  // Fuse.js instance for fuzzy searching over our posts.
  const fuse = useMemo(
    () =>
      new Fuse(digestData, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "tags", weight: 0.5 },
          { name: "summary", weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
      }),
    [digestData]
  );

  // Filter posts based on the search input and selected tags.
  const filteredBySearch =
    searchInput.length > 0
      ? fuse.search(searchInput).map((result) => result.item)
      : digestData;

  const searchResult =
    selectedTags.length > 0
      ? filteredBySearch.filter((post) =>
          selectedTags.some((tag) => post.tags.includes(tag))
        )
      : filteredBySearch;


  const visiblePosts = searchResult;

  // Make sure that the active index is still valid when visiblePosts changes.
  useEffect(() => {
    if (activeIndex >= visiblePosts.length) {
      setActiveIndex(visiblePosts.length - 1);
    } 
  }, [visiblePosts, activeIndex]);

  // Focus the container when the component mounts so that keyboard events are captured.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  // Handle up/down arrow key navigation.
  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, visiblePosts.length - 1));
    } else if (e.key === "Enter" && visiblePosts[activeIndex]) {
      
      const encodedTitle = slugify(visiblePosts[activeIndex].title);
      onOpenPost(encodedTitle, 'blog');
      // window.location.href = `/blogs/${encodedTitle}`;
    }
  };

  // Render states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (digestData.length === 0) {
    return <div>Error: Failed to load data.</div>;
  }

  // The currently selected post from our visible list.
  const activePost = visiblePosts[activeIndex];

  return (
    // The container is given tabIndex so it can capture key events.
    <div
      className="blog-output-container"
      tabIndex="0"
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {/* Left column: list of up to five posts */}
      <div className="posts-list">
        {visiblePosts.map((post, index) => (
          <div
            key={post.id}
            className={`result-item ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <h2 className="post-title">{"> " + post.title}</h2>
          </div>
        ))}
      </div>

      {/* Right column: sidebar with details for the active post */}
      <div className="post-sidebar">
        {activePost ? (
          <div className="sidebar-content">
            {/* Use the thumbnail if available; otherwise, a placeholder image */}
            <img
              src={activePost.thumbnail || "/placeholder.png"}
              alt="Thumbnail"
              className="post-thumbnail"
            />
            
            <p className="post-summary">{activePost.summary}</p>

            <div className="post-tags-container">
              tags: 
                <p className="post-tags">
                  {activePost.tags ? activePost.tags.join(", ") : "No tags"} {/* Convert array to CSV */}
                </p>
            </div>

            <div className="post-meta">
              <div>
                <strong>Created:</strong>{" "}
                {activePost.created_at 
                // convert to TIME
                ? new Date(activePost.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "UTC" // Change to user’s timezone if needed
                  })
                : "Unknown"}
              </div>
              <div>
                <strong>Modified:</strong>{" "}
                {activePost.updated_at ? new Date(activePost.updated_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "UTC" // Change to user’s timezone if needed
                  })
                : "Unknown"}
              </div>
            </div>
          </div>
        ) : (
          <div className="sidebar-placeholder">
            Select a post to see details.
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogOutput;