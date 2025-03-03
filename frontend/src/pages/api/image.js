import dotenv from "dotenv";

dotenv.config();

export async function GET({ request }) {
  try {
    const backendHost = process.env.BACKEND_HOST || "backend-svc.blog-prod.svc.cluster.local";
    const backendPort = process.env.BACKEND_PORT || "8080";

    const url = new URL(request.url);
    const imagePath = url.pathname.replace("/image/", ""); // Remove "/image/" prefix

    if (!imagePath) {
      return new Response(JSON.stringify({ error: "Missing image path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const backendUrl = `http://${backendHost}:${backendPort}/image/${imagePath}`;

    const response = await fetch(backendUrl);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("Content-Type") || "image/png";
    return new Response(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": contentType,
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