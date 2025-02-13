const conf = require(__dirname + "/../set");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Track the last text time to prevent overflow
let lastTextTime = 0;
const messageDelay = 5000; // Set the minimum delay between messages (in milliseconds)

const handleCall = async (zk, callData) => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;
    
    // Reject the call
    await zk.rejectCall(callId, callerId);

    // Check if enough time has passed since the last message
    const currentTime = Date.now();
    if (currentTime - lastTextTime >= messageDelay) {
      // Send the rejection message if the delay has passed
      await zk.sendMessage(callerId, {
        text: conf.ANTICALL_MSG
      });

      // Update the last text time
      lastTextTime = currentTime;
    } else {
      console.log('Message skipped to prevent overflow');
    }
  }
};

module.exports = handleCall;
