import { queryDB } from "../../middleware/Dbrouter"; 
import dotenv from "dotenv";

dotenv.config(); 

export async function POST({ request }) { 
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

    const body = await request.json();

    const path_ip = body.path_ip;
    const path_port = body.path_port;
    const path_specs = body.path_specs;

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing required query parameter: path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const link = `http://${path_ip}:${path_port}${path_specs}`;

    // Query the backend
    const data = await queryDB(link, path, body);

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