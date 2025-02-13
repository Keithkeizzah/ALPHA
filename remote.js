const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');

// URLs of the scripts to be downloaded
const scriptUrls = [
    "https://raw.githubusercontent.com/kkeizzah/ALPHA-TEST5/refs/heads/main/commands/Menu.js",
    "https://raw.githubusercontent.com/kkeizzah/ALPHA-TEST5/refs/heads/main/commands/Profile2.js",
    "https://raw.githubusercontent.com/kkeizzah/ALPHA-TEST5/refs/heads/main/commands/Image_dl_search.js"
];

// Paths where the scripts will be saved locally
const scriptPaths = [
    "./commands/Menu.js",
    "./commands/Profile2.js",
    "./commands/Image_dl_search.js"
];

// Function to download and execute multiple scripts
async function downloadAndRunScripts() {
    try {
        console.log("\nFetching scripts from Vortex-xmd Database...\n");

        // Loop through each script URL
        for (let i = 0; i < scriptUrls.length; i++) {
            const url = scriptUrls[i];
            const path = scriptPaths[i];

            // Fetch the script content from the URL
            const response = await axios.get(url);
            const scriptCode = response.data;

            // Save the downloaded script locally
            fs.writeFileSync(path, scriptCode, "utf-8");

            // Notify user that the script has been downloaded successfully
            console.log(`\x1b[31mScript downloaded successfully: ${path}\x1b[0m`);

            // Execute the downloaded script using Node.js
            exec(`node ${path}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Execution error in ${path}: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Script stderr in ${path}: ${stderr}`);
                }
                console.log(`Script Output from ${path}:\n${stdout}`);
            });
        }

        // Display the final message after all scripts are processed
        console.log("\n\x1b[31mAll scripts downloaded and executed successfully! Your bot is now connected.\x1b[0m");

    } catch (error) {
        console.error("Error downloading or executing the scripts:", error);
    }
}

// Start the process
downloadAndRunScripts();
