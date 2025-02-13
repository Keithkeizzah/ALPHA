
const conf = require(__dirname + '/../set');
const { profilePictureUrl } = require('@whiskeysockets/baileys');
const { recupevents } = require(__dirname + '/../bdd/welcome');

const handleGroupParticipantsUpdate = async (zk) => {
  zk.ev.on('group-participants.update', async (group) => {
    console.log(group);

    if (conf.EVENTS !== "yes") {
      return;
    }

    try {
      const metadata = await zk.groupMetadata(group.id);
      let ppgroup;
      let participants = group.participants;

      if (group.action === 'add' && await recupevents(group.id, 'welcome') === 'on') {
        let msg = '╭═══◇KEITH-TECH◇═══⊷\n';

        for (let membre of participants) {
          msg += `║ Hello @${membre.split('@')[0]}\n`;
        }

        msg += `║ you are welcomed here you may read group description to avoid being removed.\n\n ╰═══◇◇═══⊷\n\n ◇ *GROUP DESCRIPTION*  ◇\n\n${metadata.desc}`;

        try {
          ppgroup = await zk.profilePictureUrl(group.id, 'image');
        } catch {
          ppgroup = conf.URL;
        }

        await zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: participants });
      } else if (group.action === 'remove' && await recupevents(group.id, 'goodbye') === 'on') {
        let msg = 'Goodbye to that fallen soldier:\n';

        for (let membre of participants) {
          msg += `@${membre.split('@')[0]}\n`;
        }

        try {
          ppgroup = await zk.profilePictureUrl(participants[0], 'image');
        } catch {
          ppgroup = conf.URL;
        }

        await zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: participants });
      } else if (group.action === 'promote' && await recupevents(group.id, 'antipromote') === 'on') {
        if (
          group.author === metadata.owner ||
          group.author === conf.NUMERO_OWNER + '@s.whatsapp.net' ||
          group.author === zk.user.id ||
          group.author === group.participants[0]
        ) {
          console.log('Cas de superUser je fais rien');
          return;
        }

        await zk.groupParticipantsUpdate(group.id, [group.author, group.participants[0]], 'demote');

        try {
          ppgroup = await zk.profilePictureUrl(group.participants[0], 'image');
        } catch {
          ppgroup = conf.URL;
        }

        await zk.sendMessage(group.id, {
          image: { url: ppgroup },
          caption: `@${group.author.split('@')[0]} has violated the anti-promotion rule, therefore both ${group.author.split('@')[0]} and @${group.participants[0].split('@')[0]} have been removed from administrative rights.`,
          mentions: [group.author, group.participants[0]],
        });
      } else if (group.action === 'demote' && await recupevents(group.id, 'antidemote') === 'on') {
        if (
          group.author === metadata.owner ||
          group.author === conf.NUMERO_OWNER + '@s.whatsapp.net' ||
          group.author === zk.user.id ||
          group.author === group.participants[0]
        ) {
          console.log('Cas de superUser je fais rien');
          return;
        }

        await zk.groupParticipantsUpdate(group.id, [group.author], 'demote');
        await zk.groupParticipantsUpdate(group.id, [group.participants[0]], 'promote');

        try {
          ppgroup = await zk.profilePictureUrl(group.participants[0], 'image');
        } catch {
          ppgroup = conf.URL;
        }

        await zk.sendMessage(group.id, {
          image: { url: ppgroup },
          caption: `@${group.author.split('@')[0]} has violated the anti-demotion rule by removing @${group.participants[0].split('@')[0]}. Consequently, he has been stripped of administrative rights.`,
          mentions: [group.author, group.participants[0]],
        });
      }
    } catch (e) {
      console.error(e);
    }
  });
};

module.exports = handleGroupParticipantsUpdate;
