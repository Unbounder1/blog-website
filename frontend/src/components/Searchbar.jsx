import React, { useState, useMemo } from "react";
import Fuse from "fuse.js";
import "../styles/global.css"; // Import your CSS
import "../styles/searchbar.css";

const SearchBar = ({ blogArr, tags }) => {

    console.log(tags);

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
                    { name: "tags", weight: 0.5 }, // Include tags in search
                    { name: "summary", weight: 0.3 },
                ],
                threshold: 0.4, // Adjust based on desired fuzziness
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
        <div>
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Search here..."
                    onChange={handleChange}
                    value={searchInput}
                />
                <div className="tag-container">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className={`tag ${
                                selectedTags.includes(tag) ? "selected" : ""
                            }`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
            <ul className="results-list">
                {searchResult.length > 0 ? (
                    searchResult.map((post) => (
                        <li key={post.id} className="result-item">
                            <img
                                src={post.thumbnail_url}
                                alt={post.title}
                                className="post-thumbnail"
                            />
                            <h2 className="post-title">{post.title}</h2>
                            <p className="post-snippet">
                                {post.summary.substring(0, 150)}...
                            </p>
                            <div className="post-tags">
                                {post.tags.map((tag, idx) => (
                                    <span key={idx} className="tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <small className="post-date">
                                Published on:{" "}
                                {new Date(post.created_at).toLocaleDateString()}
                            </small>
                        </li>
                    ))
                ) : (
                    <li className="no-results">No results found.</li>
                )}
            </ul>
        </div>
    );
};

export default SearchBar;