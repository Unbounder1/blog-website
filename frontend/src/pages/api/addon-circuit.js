import { queryDB } from "../../middleware/Dbrouter"; 
import dotenv from "dotenv";

dotenv.config(); 

export async function POST({ request }) { 
    // General Format for Addons:

    // PATH
    // path_ip = ip host, ie localhost
    // path_port = ip port, ie port
    // Fetch Format ->  http://path_ip:path_port/

    // CONTENT
    // body_content

  try {

    const body = await request.json();

    const backendHost = process.env.BACKEND_HOST;
    const backendPort = process.env.BACKEND_PORT;

    const url = new URL(request.url);
    const path = url.searchParams.get("path");

    const link = `http://${backendHost}:${backendPort}/addon/circuit-scan/`;

    // Query the backend
    const data = await queryDB(link, "/addon/circuit-scan/", body);

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