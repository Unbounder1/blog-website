import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";
import "../../styles/global.css"; 
import "../../styles/searchbar.css";

function slugify(text) {
    return text
      .toString()
      .normalize('NFD')                   // Normalize diacritics
      .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')        // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '');           // Remove leading/trailing hyphens
  }

const BlogOutputFull = ({ blogArr, tags }) => {

    if (blogArr == null && tags == null){
        return;
    }

    console.log(blogArr[0].summary)

    const [searchInput, setSearchInput] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);

    const handleChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleTagClick = (tag) => {
        setSelectedTags((prevSelectedTags) => {
            if (tag === "reset") {
                return [];
            }

            if (prevSelectedTags.includes(tag)) {
                return prevSelectedTags.filter((t) => t !== tag);
            } else {
                return [...prevSelectedTags, tag];
            }
        });
    };

    const fuse = useMemo(
        () =>
            new Fuse(blogArr, {
                keys: [
                    { name: "title", weight: 0.7 }, 
                    { name: "tags", weight: 0.5 }, 
                    { name: "summary", weight: 0.3 },
                ],
                threshold: 0.4, 
                includeScore: true,
                ignoreLocation: true,
            }),
        [blogArr]
    );

    let filteredBySearch =
        searchInput.length > 0
            ? fuse.search(searchInput).map((result) => result.item)
            : blogArr;

    const searchResult =
        selectedTags.length > 0
            ? filteredBySearch.filter((post) =>
                  selectedTags.some((tag) => post.tags.includes(tag))
              )
            : filteredBySearch;

    return (
        <div className="blog-output">
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
                </li>
                ))
            ) : (
                <li className="no-results">No results found.</li>
            )}
        </ul>
        </div>
        
    );
};

export default BlogOutputFull;

{/* <div>
        <div className="search-bar-container">
            <input
                type="text"
                placeholder="Search here..."
                onChange={handleChange}
                value={searchInput}
                className="search-input"
            />
        </div>
        <ul className="results-list">
            {searchResult.length > 0 ? (
                searchResult.map((post) => (
                    <li key={post.id} className="result-item">
                        <h2 
                            className="post-title" 
                            onClick={() => {
                                const encodedTitle = slugify(post.title);
                                window.location.href = `/blogs/${encodedTitle}`;
                            }}
                        >
                            {post.title}
                        </h2>
                        <p className="post-description">
                            - Description: {post.summary}
                        </p>
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
    </div> */}