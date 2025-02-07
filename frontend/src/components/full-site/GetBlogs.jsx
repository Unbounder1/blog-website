import { useEffect, useState } from "react";
import SearchBar from "../Searchbar.jsx";
import BlogOutputFull from "./ShellTerminal.jsx";
import { queryDB } from "../../middleware/Dbrouter.jsx";

const Blogdigest = () => {
  const [digestData, setDigestData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendHost = import.meta.env.PUBLIC_BACKEND_HOST || "localhost";
  const backendPort = import.meta.env.PUBLIC_BACKEND_PORT || "8080";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to fetch digest and tag data in parallel
        const [digest, tags] = await Promise.all([
          fetch("/api/data?path=/digest").then(res => res.json()),
          fetch("/api/data?path=/tags").then(res => res.json())
        ]);
        
        console.log("Fetched Digest Data:", digest);
        console.log("Fetched Tag Data:", tags);

        // Guard for digest
        if (Array.isArray(digest)) {
          setDigestData(digest);
        } else {
          console.warn("Empty or invalid digest data:", digest);
        }

        // Guard for tags
        if (Array.isArray(tags)) {
          setTagData(tags);
        } else {
          console.warn("Empty or invalid tag data:", tags);
        }

      } catch (error) {
        console.error("Error fetching from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendHost, backendPort]);

  // Loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no data returned
  if (digestData.length === 0) {
    return <div>Error: Failed to load data.</div>;
  }

  // Render
  return (
    <div>
      {/* <SearchBar blogArr={digestData} tags={tagData} /> */}
      <BlogOutputFull blogArr={digestData} tags={tagData} />
    </div>
  );
};

export default Blogdigest;