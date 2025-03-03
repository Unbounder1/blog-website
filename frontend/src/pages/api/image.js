import dotenv from "dotenv";

dotenv.config();

export async function GET({ request }) {
  console.log("📢 Received request for:", request.url);

  // Extract query parameters from URL
  const url = new URL(request.url);
  const blogID = url.searchParams.get("blogID");
  const imageName = url.searchParams.get("imageName");

  if (!blogID || !imageName) {
    return new Response(JSON.stringify({ error: "Missing parameters: blogID or imageName" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendHost = process.env.BACKEND_HOST || "backend-svc.blog-prod.svc.cluster.local";
  const backendPort = process.env.BACKEND_PORT || "8080";
  const backendUrl = `http://${backendHost}:${backendPort}/image/blog/${blogID}/${imageName}`;

  console.log(`🔗 Fetching from backend: ${backendUrl}`);

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
}