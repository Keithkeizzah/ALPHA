const { isGroupBanned, isGroupOnlyAdmin, isUserBanned } = require('../bdd/ban'); // Adjust the path to your ban functions

const handleCommandExecution = async (origineMessage, zk, ms, cd, commandeOptions) => {
  const { verifGroupe, verifAdmin, superUser, auteurMessage, repondre } = commandeOptions;

  try {
    if (!superUser && verifGroupe) {
      let req = await isGroupBanned(origineMessage);
      if (req) {
        return;
      }
    }

    if (!verifAdmin && verifGroupe) {
      let req = await isGroupOnlyAdmin(origineMessage);
      if (req) {
        return;
      }
    }

    if (!superUser) {
      let req = await isUserBanned(auteurMessage);
      if (req) {
        repondre("You are banned from bot commands");
        return;
      }
    }

    reagir(origineMessage, zk, ms, cd.reaction);
    cd.fonction(origineMessage, zk, commandeOptions);
  } catch (e) {
    console.log("😡😡 " + e);
    zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
  }
};

module.exports = handleCommandExecution;
