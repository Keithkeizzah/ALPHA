const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Auto-like function
const handleAutoLikeStatus = async (zk, conf) => {
  if (conf.AUTO_LIKE_STATUS === "yes") {
    console.log("AUTO_LIKE_STATUS is enabled. Listening for status updates...");

    let lastReactionTime = 0;

    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;

      for (const message of messages) {
        // Check if the message is a status update
        if (message.key && message.key.remoteJid === "status@broadcast") {
          console.log("Detected status update from:", message.key.remoteJid);

          // Ensure throttling by checking the last reaction time
          const now = Date.now();
          if (now - lastReactionTime < 5000) {  // 5-second interval
            console.log("Throttling reactions to prevent overflow.");
            continue;
          }

          // Check if bot user ID is available
          const keith = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
          if (!keith) {
            console.log("Bot's user ID not available. Skipping reaction.");
            continue;
          }

          // Fetch emojis from conf.EMOJIS
          const emojis = conf.EMOJIS.split(',');

          // Select a random love emoji
          const randomLoveEmoji = emojis[Math.floor(Math.random() * emojis.length)];

          // React to the status with the selected love emoji
          await zk.sendMessage(message.key.remoteJid, {
            react: {
              key: message.key,
              text: randomLoveEmoji, // Reaction emoji
            },
          });

          // Log successful reaction and update the last reaction time
          lastReactionTime = Date.now();
          console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

          // Delay to avoid rapid reactions
          await delay(2000); // 2-second delay between reactions
        }
      }
    });
  }
};

module.exports = handleAutoLikeStatus;

