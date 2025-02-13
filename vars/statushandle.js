
const handleStatus = async (zk, conf) => {
  let lastTextTime = 0;
  const messageDelay = 5000; // Set the minimum delay between messages (in milliseconds)
  const idBot = zk.user.id;

  zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];
    const currentTime = Date.now();

    try {
      // Ensure that we're working with status messages
      if (!ms.key || ms.key.remoteJid !== "status@broadcast") return;

      // Auto Status Reply
      if (conf.AUTO_STATUS_REPLY === "yes") {
        if (currentTime - lastTextTime >= messageDelay) {
          const user = ms.key.participant;
          const text = `${conf.AUTO_STATUS_MSG || 'Default reply'}`;

          await zk.sendMessage(user, {
            text: text,
            react: { text: '⚔️', key: ms.key }
          });

          lastTextTime = currentTime;
        }
      }

      // Auto Read Status
      if (conf.AUTO_READ_STATUS === "yes") {
        await zk.readMessages([ms.key]);
      }

      // Auto Download Status
      if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
        if (ms.message.extendedTextMessage) {
          const stTxt = ms.message.extendedTextMessage.text;
          await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
        } else if (ms.message.imageMessage) {
          const stMsg = ms.message.imageMessage.caption;
          const stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
          await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
        } else if (ms.message.videoMessage) {
          const stMsg = ms.message.videoMessage.caption;
          const stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
          await zk.sendMessage(idBot, { video: { url: stVideo }, caption: stMsg }, { quoted: ms });
        }
      }
    } catch (error) {
      console.error("Error handling status message:", error);
    }
  });
};

module.exports = handleStatus;
