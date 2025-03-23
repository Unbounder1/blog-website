import CryptoJS from "crypto-js";
import dotenv from "dotenv";

function generateHmac(data) {
    //.env HMAC_API_KEY
    return CryptoJS.HmacSHA256(data, process.env.HMAC_API_KEY).toString(CryptoJS.enc.Hex);
}

export async function queryDB(link, path, body = null) {
    try {
      const hmac = generateHmac(path);
  
      const options = {
        headers: {
          "X-HMAC-Signature": hmac,
        },
        method: body ? "POST" : "GET",
        ...(body && { 
          body: JSON.stringify(body),
          headers: {
            ...{ "X-HMAC-Signature": hmac },
            "Content-Type": "application/json"
          }
        }),
      };
  
      const response = await fetch(link, options);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error querying the database:", error);
      throw error;
    }
  }