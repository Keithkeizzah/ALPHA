
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require("fs-extra");
const { verifierEtatJid, recupererActionJid } = require("../bdd/antilien");
const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require("../bdd/warn");
const conf = require("../set");

const handleAntiLink = async (zk, ms, origineMessage, texte, verifGroupe, admins, idBot, auteurMessage, verifAdmin, superUser) => {
    try {
        const yes = await verifierEtatJid(origineMessage);
        if (texte.includes('https://') && verifGroupe && yes) {
            console.log("link detected");

            const verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;

            if (superUser || verifAdmin || !verifZokAdmin) {
                console.log('I will do nothing');
                return;
            }

            const key = {
                remoteJid: origineMessage,
                fromMe: false,
                id: ms.key.id,
                participant: auteurMessage
            };

            let txt = "link detected, \n";
            const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
            const sticker = new Sticker(gifLink, {
                pack: '',
                author: conf.OWNER_NAME,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            await sticker.toFile("st1.webp");

            const action = await recupererActionJid(origineMessage);

            if (action === 'remove') {
                txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

                await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });

                try {
                    await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                } catch (e) {
                    console.log("antilien error: " + e);
                }

                await zk.sendMessage(origineMessage, { delete: key });
                await fs.unlink("st1.webp");

            } else if (action === 'delete') {
                txt += `Goodbye \n @${auteurMessage.split("@")[0]} Sending other group links here is prohibited!`;

                await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                await zk.sendMessage(origineMessage, { delete: key });
                await fs.unlink("st1.webp");

            } else if (action === 'warn') {
                let warn = await getWarnCountByJID(auteurMessage);
                let warnlimit = conf.WARN_COUNT;

                if (warn >= warnlimit) {
                    let kikmsg = `link detected, you will be removed because of reaching warn-limit`;

                    await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms });
                    await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                    await zk.sendMessage(origineMessage, { delete: key });

                } else {
                    let rest = warnlimit - warn;
                    let msg = `Link detected, your warn_count was upgraded;\n remaining: ${rest}`;

                    await ajouterUtilisateurAvecWarnCount(auteurMessage);
                    await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms });
                    await zk.sendMessage(origineMessage, { delete: key });
                }
            }
        }
    } catch (e) {
        console.log("bdd error: " + e);
    }
};

module.exports = handleAntiLink;
