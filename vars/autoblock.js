const handleAutoBlock = async (zk, origineMessage, auteurMessage, superUser, conf) => {
  if (!superUser && origineMessage === auteurMessage && conf.AUTO_BLOCK === 'yes') {
    await zk.sendMessage(auteurMessage, {
      'text': `🚫 I am blocking you because you have violated ${conf.OWNER_NAME} policies 🚫!`
    });
    await zk.updateBlockStatus(auteurMessage, 'block');
  }
};

module.exports = handleAutoBlock;
