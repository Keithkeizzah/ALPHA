const handleAutoRead = async (zk, conf) => {
  if (conf.AUTO_READ_MESSAGES === "yes") {
    zk.ev.on("messages.upsert", async m => {
      const { messages } = m;
      for (const message of messages) {
        if (!message.key.fromMe) {
          await zk.readMessages([message.key]);
        }
      }
    });
  }
};

module.exports = handleAutoRead;
