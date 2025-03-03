import dotenv from "dotenv";

dotenv.config();

export async function GET({ params }) {
  try {
    const backendHost = process.env.BACKEND_HOST || "backend-svc.blog-prod.svc.cluster.local";
    const backendPort = process.env.BACKEND_PORT || "8080";

    // Extract blogID and imageName from the URL
    const blogID = params.blogID;
    const imageName = params.imageName;

    if (!blogID || !imageName) {
      return new Response(JSON.stringify({ error: "Missing blog ID or image name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Proxy request to Gin backend
    const backendUrl = `http://${backendHost}:${backendPort}/image/blog/${blogID}/${imageName}`;

    console.log(`Fetching image from: ${backendUrl}`);

    // Fetch the image from the backend
    const response = await fetch(backendUrl);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
      },
    });
  } catch (error) {
    console.error("Error in /api/image route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}