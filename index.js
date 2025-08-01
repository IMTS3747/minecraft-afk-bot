const mineflayer = require('mineflayer')
const cmd = require('mineflayer-cmd').plugin
const fs = require('fs');
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = [ 'forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 0; // 2 second movement interval
var maxrandom = 2; // 0-5 seconds added to movement interval (randomly)
var host = data["ip"];
var username = data["name"]
var nightskip = data["auto-night-skip"]
var bot = mineflayer.createBot({
  host: host,
  username: username,
  version: '1.21.7' 
});
function getRandomArbitrary(min, max) {
       return Math.random() * (max - min) + min;

}

bot.loadPlugin(cmd)

let isSneaking = false;

bot.on('login',function(){
    console.log("Logged In")
    bot.chat("hello, this is an bot made by I'm TS to join this specific server so the server doesn't become offline due to no one playing. please ignore any activities done by the bot every activity is done to keep the server online and playable 24/7.");
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
    if(nightskip == "true"){
    if(bot.time.timeOfDay >= 13000){
    bot.chat('/time set day')
    }}
    if (connected <1) {
        return;
    }
    if (lasttime<0) {
        lasttime = bot.time.age;
    } else {
        var randomadd = Math.random() * maxrandom * 20;
        var interval = moveinterval*20 + randomadd;
        if (bot.time.age - lasttime > interval) {
            // Stop the previous action before starting a new one
            if (moving == 1) {
                bot.setControlState(lastaction,false);
            }

            // Choose a new random direction and movement
            var yaw = Math.random()*pi - (0.5*pi);
            var pitch = Math.random()*pi - (0.5*pi);
            bot.look(yaw,pitch,false);
            lastaction = actions[Math.floor(Math.random() * actions.length)];
            bot.setControlState(lastaction,true);

            // Update state
            moving = 1;
            lasttime = bot.time.age;
            bot.activateItem();
        }
    }
});

bot.on('spawn',function() {
    connected=1;
    // The bot has just spawned/respawned.
    // Teleport it to the specific coordinates.
    // Note: The bot needs OP privileges or a plugin to allow this command.
    bot.chat('/tp -11 67 10');
});

bot.on('death',function() {
    bot.emit("respawn")
});