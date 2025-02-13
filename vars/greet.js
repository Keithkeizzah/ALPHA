const handleAutoReply = (zk, conf) => {
  // Track contacts that have already received the auto-reply
  let repliedContacts = new Set();

  zk.ev.on("messages.upsert", async m => {
    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) {
      return;
    }
    const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
    const remoteJid = ms.key.remoteJid;

    // Get the sender's JID and number
    const sender = ms.key.remoteJid;
    const senderNumber = sender.split('@')[0];

    // Update the auto-reply message dynamically
    let auto_reply_message = `Hello @${senderNumber}, my owner is unavailable right now kindly leave a message*.`;

    // Check if the message exists and is a command to set a new auto-reply message with any prefix
    if (messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
      const prefix = messageText[0]; // Detect the prefix
      const command = messageText.slice(1).split(" ")[0]; // Command after prefix
      const newMessage = messageText.slice(prefix.length + command.length).trim(); // New message content

      // Update the auto-reply message if the command is 'setautoreply'
      if (command === "setautoreply" && newMessage) {
        auto_reply_message = newMessage;
        await zk.sendMessage(remoteJid, {
          text: `Auto-reply message has been updated to:\n"${auto_reply_message}"`
        });
        return;
      }
    }

    // Check if auto-reply is enabled, contact hasn't received a reply, and it's a private chat
    if (conf.GREET === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
      await zk.sendMessage(remoteJid, {
        text: auto_reply_message,
        mentions: [sender]
      });

      // Add contact to replied set to prevent repeat replies
      repliedContacts.add(remoteJid);
    }
  });
};

module.exports = handleAutoReply;
