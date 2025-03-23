import { queryDB } from "../../middleware/Dbrouter"; 
import dotenv from "dotenv";

dotenv.config(); 

export async function GET({ request }) { 
    // General Format for Addons:

    // PATH
    // path_ip = ip host, ie localhost
    // path_port = ip port, ie port
    // path_specs = 
    // Fetch Format ->  http://path_ip:path_port/path_specs/

    // CONTENT
    // body_content
    // 

  try {

    const url = new URL(request.url);
    const path_ip = url.searchParams.get("path_ip");
    const path_port = url.searchParams.get("path_port");
    const path_specs = url.searchParams.get("path_specs");

    if (!backendHost || !backendPort) {
      return new Response(JSON.stringify({ error: "Missing BACKEND_HOST or BACKEND_PORT" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing required query parameter: path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const link = `http://${path_ip}:${path_port}${path_specs}`;

    // Query the backend
    const data = await queryDB(link, path, request.body);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in /api/data route:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}