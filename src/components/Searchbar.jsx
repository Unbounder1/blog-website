import React, { useState, useMemo } from "react";
import Fuse from 'fuse.js';
import "../styles/global.css"; // Import your CSS
import "../styles/searchbar.css";

const SearchBar = () => {
    const blogArr = [
        {
            id: 1,
            name: "Understanding JavaScript Closures",
            body: "JavaScript closures are a fundamental concept that every JavaScript developer should understand. A closure is the combination of a function and the lexical environment within which that function was declared...",
            tags: ["JavaScript", "Programming", "Closures"],
            date: "2024-01-15",
        },
        {
            id: 2,
            name: "A Guide to React Hooks",
            body: "React Hooks have revolutionized how we write React components. Hooks allow you to use state and other React features without writing a class. In this guide, we'll explore useState, useEffect, and custom hooks...",
            tags: ["React", "JavaScript", "Hooks"],
            date: "2024-02-10",
        },
        {
            id: 3,
            name: "CSS Grid vs. Flexbox: When to Use Which",
            body: "CSS Grid and Flexbox are powerful layout systems in CSS. While they share some similarities, they serve different purposes. Flexbox is ideal for one-dimensional layouts, whereas Grid excels at two-dimensional layouts...",
            tags: ["CSS", "Design", "Flexbox", "Grid"],
            date: "2024-03-05",
        },
        {
            id: 4,
            name: "Introduction to TypeScript",
            body: "TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript. It offers static typing, classes, and interfaces, which help in building robust and maintainable codebases...",
            tags: ["TypeScript", "JavaScript", "Programming"],
            date: "2024-04-20",
        },
        {
            id: 5,
            name: "Building RESTful APIs with Node.js",
            body: "Node.js provides a non-blocking, event-driven architecture ideal for building scalable RESTful APIs. In this article, we'll walk through setting up an Express server, defining routes, and connecting to a MongoDB database...",
            tags: ["Node.js", "API", "Express", "MongoDB"],
            date: "2024-05-18",
        },
        // Add more blog posts as needed
    ];

    let tags = ["JavaScript", "Programming", "Closures", "Node.js", "API", "Express", "MongoDB"];
    tags.unshift("reset");

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

    // Initialize Fuse.js with memoization for performance
    const fuse = useMemo(() => new Fuse(blogArr, {
        keys: [
            { name: 'name', weight: 0.7 }, // Higher weight for titles
            { name: 'body', weight: 0.3 },
            { name: 'tags', weight: 0.5 },
        ],
        threshold: 0.4, // Adjust based on desired fuzziness
        includeScore: true, // To sort results by relevance
        ignoreLocation: true, // Makes the search less dependent on the location of the match
    }), [blogArr]);

    let filteredBySearch = searchInput.length > 0
        ? fuse.search(searchInput).map(result => result.item)
        : blogArr;

    const searchResult = selectedTags.length > 0
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
            searchResult.map((ti) => (
                <li key={ti.id} className="result-item">
                    <h2 className="post-title">{ti.name}</h2>
                    <p className="post-snippet">{ti.body.substring(0, 150)}...</p> {/* Display a snippet */}
                    <div className="post-tags">
                        {ti.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <small className="post-date">
                        Published on: {new Date(ti.date).toLocaleDateString()}
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