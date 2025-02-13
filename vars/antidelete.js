
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const store = { chats: {} }; // Assuming a store object to store messages

// Function to format notification message
function createNotification(deletedMessage) {
  const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
  let notification = `*😈ALPHA ANTIDELETE👿*\n\n`;
  notification += `*Time deleted🥀:* ${new Date().toLocaleString()}\n`;
  notification += `*Deleted by🌷:* @${deletedBy.split('@')[0]}\n\n*Powered by Keithkeizzah*\n\n`;
  return notification;
}

// Helper function to download media
async function downloadMedia(message) {
  try {
    if (message.imageMessage) {
      return await downloadMediaMessage(message.imageMessage);
    } else if (message.videoMessage) {
      return await downloadMediaMessage(message.videoMessage);
    } else if (message.documentMessage) {
      return await downloadMediaMessage(message.documentMessage);
    } else if (message.audioMessage) {
      return await downloadMediaMessage(message.audioMessage);
    } else if (message.stickerMessage) {
      return await downloadMediaMessage(message.stickerMessage);
    } else if (message.voiceMessage) {
      return await downloadMediaMessage(message.voiceMessage);
    } else if (message.gifMessage) {
      return await downloadMediaMessage(message.gifMessage);
    }
  } catch (error) {
    console.error("Error downloading media:", error);
  }
  return null;
}

// Anti-delete function
const handleAntiDelete = async (zk, conf, m) => {
  if (conf.ADM === "yes") {
    const { messages } = m;
    const ms = messages[0];

    // If the message has no content, ignore
    if (!ms.message) {
      return;
    }

    // Get the message key and remote JID (group or individual)
    const messageKey = ms.key;
    const remoteJid = messageKey.remoteJid;

    // Store message for future undelete reference
    if (!store.chats[remoteJid]) {
      store.chats[remoteJid] = [];
    }

    // Save the received message to storage
    store.chats[remoteJid].push(ms);

    // Handle deleted messages (when protocolMessage is present and type is 0)
    if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
      const deletedKey = ms.message.protocolMessage.key;

      // Search for the deleted message in the stored messages
      const chatMessages = store.chats[remoteJid];
      const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

      if (deletedMessage) {
        try {
          // Create notification about the deleted message
          const notification = createNotification(deletedMessage);

          // Check the type of the deleted message (text or media)
          if (deletedMessage.message.conversation) {
            // Text message
            await zk.sendMessage(remoteJid, {
              text: notification + `*Message:* ${deletedMessage.message.conversation}`,
              mentions: [deletedMessage.key.participant]
            });
          } else if (
            deletedMessage.message.imageMessage ||
            deletedMessage.message.videoMessage ||
            deletedMessage.message.documentMessage ||
            deletedMessage.message.audioMessage ||
            deletedMessage.message.stickerMessage ||
            deletedMessage.message.voiceMessage ||
            deletedMessage.message.gifMessage
          ) {
            // Media message (image, video, document, audio, sticker, voice, gif)
            const mediaBuffer = await downloadMedia(deletedMessage.message);
            if (mediaBuffer) {
              let mediaType = 'audio'; // Default to 'audio' if no other match

              if (deletedMessage.message.imageMessage) mediaType = 'image';
               if (deletedMessage.message.videoMessage) mediaType = 'video';
              if (deletedMessage.message.documentMessage) mediaType = 'document';
              if (deletedMessage.message.stickerMessage) mediaType = 'sticker';
              if (deletedMessage.message.voiceMessage) mediaType = 'audio'; // Voice messages can be treated as audio
              if (deletedMessage.message.gifMessage) mediaType = 'video'; // GIFs are generally video type

              // Send the media with notification and participant mention
              await zk.sendMessage(remoteJid, {
                [mediaType]: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
        } catch (error) {
          console.error('Error handling deleted message:', error);
        }
      }
    }
  }
};

module.exports = handleAntiDelete;
