const mineflayer = require('mineflayer');
const cmd = require('mineflayer-cmd').plugin;
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

// You can use a more concise login message to avoid character limits
const loginMessage = "I'm a 24/7 AFK bot. Please ignore my activities. All actions are to keep the server online.";

// Function to generate a random username
function generateRandomUsername() {
    const prefix = "afkbot_";
    const randomSuffix = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return prefix + randomSuffix;
}

var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = [ 'forward', 'back', 'left', 'right'];
var lastaction;
var pi = 3.14159;
var moveinterval = 0; // 0 second movement interval
var maxrandom = 2; // 0-2 seconds added to movement interval (randomly)
var host = data["ip"];
var username = generateRandomUsername();
var nightskip = data["auto-night-skip"];

// Create a function to connect the bot so it can be called again to reconnect.
function createBot() {
    // Re-generate a new username each time we try to connect
    username = generateRandomUsername();

    const bot = mineflayer.createBot({
        host: host,
        username: username,
        version: '1.21.7',
        port: parseInt(data.port)
    });

    bot.loadPlugin(cmd);

    let isSneaking = false;

    bot.on('login', function() {
        console.log(`Logged In as ${bot.username}`);
        bot.chat(loginMessage);
    });

    // Reconnection handler to automatically rejoin after being kicked or disconnected.
    bot.on('kicked', (reason, loggedIn) => {
        console.log(`Bot was kicked: ${reason}`);
        console.log("Reconnecting in 10 seconds with a new name...");
        setTimeout(createBot, 10000); // Wait 10 seconds and try to reconnect
    });

    bot.on('error', err => {
        console.error(`Bot encountered an error: ${err.message}`);
    });

    bot.on('end', () => {
        console.log("Bot disconnected. Reconnecting in 10 seconds with a new name...");
        setTimeout(createBot, 10000); // Wait 10 seconds and try to reconnect
    });

    bot.on('physicTick', () => {
        // Jump constantly
        if (!bot.getControlState('jump')) {
            bot.setControlState('jump', true);
        }

        // Toggle sneak every 500ms (10 Minecraft ticks)
        if (bot.time.age % 10 === 0) {
            isSneaking = !isSneaking;
            bot.setControlState('sneak', isSneaking);
        }
    });

    bot.on('time', function(time) {
        if (nightskip == "true") {
            if (bot.time.timeOfDay >= 13000) {
                bot.chat('/time set day');
            }
        }
        if (connected < 1) {
            return;
        }
        if (lasttime < 0) {
            lasttime = bot.time.age;
        } else {
            var randomadd = Math.random() * maxrandom * 20;
            var interval = moveinterval * 20 + randomadd;
            if (bot.time.age - lasttime > interval) {
                // Stop the previous action before starting a new one
                if (moving == 1) {
                    bot.setControlState(lastaction, false);
                }

                // Choose a new random direction and movement
                var yaw = Math.random() * pi - (0.5 * pi);
                var pitch = Math.random() * pi - (0.5 * pi);
                bot.look(yaw, pitch, false);
                lastaction = actions[Math.floor(Math.random() * actions.length)];
                bot.setControlState(lastaction, true);

                // Update state
                moving = 1;
                lasttime = bot.time.age;
                bot.activateItem();
            }
        }
    });

    bot.on('spawn', function() {
        connected = 1;
        lasttime = -1; // Reset lasttime to ensure movement starts properly
        // The bot has just spawned/respawned.
        // Teleport it to the specific coordinates.
        // Note: The bot needs OP privileges or a plugin to allow this command.
        bot.chat('/tp -11 67 10');
    });
    
    // Removed the 'death' event handler
}

// Start the bot for the first time.
createBot();