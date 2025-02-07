// File: BlogOutput.jsx
import React, { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import "../../styles/global.css";
import "../../styles/blogoutput.css";

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

function BlogOutput({ searchInput, selectedTags }) {
  const [digestData, setDigestData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog digest data when the component mounts
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
  }, []); // Only render once

  // Fuse.js instance for fuzzy searching
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

  // Filter the posts based on the search input and selected tags
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

  // Render states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (digestData.length === 0) {
    return <div>Error: Failed to load data.</div>;
  }

  return (
    <ul className="results-list">
      {searchResult.length > 0 ? (
        searchResult.map((post) => (
          <li
            key={post.id}
            className="result-item"
            onClick={() => {
              const encodedTitle = slugify(post.title);
              window.location.href = `/blogs/${encodedTitle}`;
            }}
          >
            <h2 className="post-title">{"> " + post.title}</h2>
            <p className="post-description">- Description: {post.summary}</p>
            <div className="post-tags">
              - Tags:{" "}
              {post.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                  {idx < post.tags.length - 1 && ","}
                </span>
              ))}
            </div>
          </li>
        ))
      ) : (
        <li className="no-results">No results found.</li>
      )}
    </ul>
  );
}

export default BlogOutput;