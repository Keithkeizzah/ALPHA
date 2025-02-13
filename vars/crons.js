const cron = require('node-cron');
const { getCron } = require('../bdd/cron');
const conf = require('../set');

async function activateCrons(zk) {
  try {
    let crons = await getCron();
    console.log(crons);

    if (crons.length > 0) {
      for (let i = 0; i < crons.length; i++) {
        if (crons[i].mute_at != null) {
          let set = crons[i].mute_at.split(':');
          console.log(`Establishing an automute for ${crons[i].group_id} at ${set[0]} H ${set[1]}`);

          cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
            await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
            await zk.sendMessage(crons[i].group_id, { image: { url: conf.URL }, caption: "Hello, it's time to close the group; sayonara." });
          }, {
            timezone: "Africa/Nairobi"
          });
        }

        if (crons[i].unmute_at != null) {
          let set = crons[i].unmute_at.split(':');
          console.log(`Establishing an autounmute for ${crons[i].group_id} at ${set[0]} H ${set[1]}`);

          cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
            await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');
            await zk.sendMessage(crons[i].group_id, { image: { url: conf.URL }, caption: "Good morning; It's time to open the group." });
          }, {
            timezone: "Africa/Nairobi"
          });
        }
      }
    } else {
      console.log('No crons were activated');
    }
  } catch (e) {
    console.error('Error activating crons:', e);
  }
}

async function handleContactsUpsert(contacts) {
  const insertContact = (newContact) => {
    for (const contact of newContact) {
      if (store.contacts[contact.id]) {
        Object.assign(store.contacts[contact.id], contact);
      } else {
        store.contacts[contact.id] = contact;
      }
    }
  };
  insertContact(contacts);
}

module.exports = {
  activateCrons,
  handleContactsUpsert
};
