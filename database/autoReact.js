// database/autoReact.js
const fs = require('fs');
const path = require('path');

// Function to handle the AUTO_REACT functionality
async function autoReact(zk, conf) {
  if (conf.AUTO_REACT === "yes") {
    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;

      // Load emojis from the JSON file
      const emojiFilePath = path.resolve(__dirname, 'emojis.json'); // Assuming the file is in the same directory as this module
      let emojis = [];
      
      try {
        // Read the emojis from the file
        const data = fs.readFileSync(emojiFilePath, 'utf8');
        emojis = JSON.parse(data); // Parse the JSON data into an array
      } catch (error) {
        console.error('Error reading emojis file:', error);
        return;
      }

      // Process each message
      for (const message of messages) {
        if (!message.key.fromMe) {  // Skip messages from the bot itself
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

          try {
            // React to the message with a random emoji
            await zk.sendMessage(message.key.remoteJid, {
              react: {
                text: randomEmoji,
                key: message.key
              }
            });
          } catch (error) {
            console.error('Error reacting to message:', error);
          }
        }
      }
    });
  }
}

module.exports = autoReact;
