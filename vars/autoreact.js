
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const handleAutoReact = async (zk, conf) => {
  if (conf.AUTO_REACT === "yes") {
    let lastReactionTime = 0;
    const reactionInterval = 5000; // 5-second interval

    zk.ev.on("messages.upsert", async m => {
      const { messages } = m;

      // Fetch emojis from conf.EMOJIS
      const emojis = conf.EMOJIS.split(',');

      // Process each message
      for (const message of messages) {
        // Ensure throttling by checking the last reaction time
        const now = Date.now();
        if (now - lastReactionTime < reactionInterval) {
          console.log("Throttling reactions to prevent overreaction.");
          continue;
        }

        if (!message.key.fromMe) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          
          // React to the message with a random emoji
          await zk.sendMessage(message.key.remoteJid, {
            react: {
              text: randomEmoji,
              key: message.key
            }
          });

          // Log successful reaction and update the last reaction time
          lastReactionTime = now;
          console.log(`Successfully reacted to message from ${message.key.remoteJid} with ${randomEmoji}`);

          // Delay to avoid rapid reactions
          await delay(reactionInterval); // Delay between reactions
        }
      }
    });
  }
};

module.exports = handleAutoReact;
