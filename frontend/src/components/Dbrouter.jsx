import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

function generateHmac(data) {
    //.env HMAC_API_KEY
    console.log(process.env.HMAC_API_KEY.length)
    return CryptoJS.HmacSHA256(data, process.env.HMAC_API_KEY.toString).toString(CryptoJS.enc.Hex);
}

export async function queryDB(link) {
    try {
        // Generate the HMAC for the URL
        const hmac = generateHmac(link);

        const response = await fetch(link, {
            method: "GET",
            headers: {
                "X-HMAC-Signature": hmac,
            },
        });

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