const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const conf = require('../set');
const { recupererToutesLesValeurs } = require('../bdd/mention'); // Adjust the path to your mention functions

const handleMentions = async (origineMessage, zk, ms, mtype, idBot, superUser) => {
  try {
    if (
      ms.message[mtype].contextInfo.mentionedJid &&
      (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||
        ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))
    ) {
      if (origineMessage === '120363158701337904@g.us') {
        return;
      }

      if (superUser) {
        console.log('hummm');
        return;
      }

      let alldata = await recupererToutesLesValeurs();

      let data = alldata[0];

      if (data.status === 'non') {
        console.log('mentions not active');
        return;
      }

      let msg;

      if (data.type.toLocaleLowerCase() === 'image') {
        msg = {
          image: { url: data.url },
          caption: data.message,
        };
      } else if (data.type.toLocaleLowerCase() === 'video') {
        msg = {
          video: { url: data.url },
          caption: data.message,
        };
      } else if (data.type.toLocaleLowerCase() === 'sticker') {
        let stickerMess = new Sticker(data.url, {
          pack: conf.NOM_OWNER,
          type: StickerTypes.FULL,
          categories: ['🤩', '🎉'],
          id: '12345',
          quality: 70,
          background: 'transparent',
        });

        const stickerBuffer2 = await stickerMess.toBuffer();
        msg = {
          sticker: stickerBuffer2,
        };
      } else if (data.type.toLocaleLowerCase() === 'audio') {
        msg = {
          audio: { url: data.url },
          mimetype: 'audio/mp4',
        };
      }

      await zk.sendMessage(origineMessage, msg, { quoted: ms });
    }
  } catch (error) {
    console.error('Error handling mentions:', error);
  }
};

module.exports = handleMentions;
```
