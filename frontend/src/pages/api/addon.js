import { queryDB } from "../../middleware/Dbrouter"; 
import dotenv from "dotenv";

dotenv.config(); 

export async function GET({ request }) { 
    // General Format for Addons:

    // PATH
    // path_ip = ip host, ie localhost
    // path_port = ip port, ie port
    // path_spec = 
    // Fetch Format ->  http://path_ip:path_port/path_spec/

    // CONTENT
    // body_content
    // 

  try {
    const backendHost = process.env.BACKEND_HOST;
    const backendPort = process.env.BACKEND_PORT;

    const url = new URL(request.url);
    const path = url.searchParams.get("path");

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

    const link = `http://${backendHost}:${backendPort}${path}`;

    // Query the backend
    const data = await queryDB(link, path);

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