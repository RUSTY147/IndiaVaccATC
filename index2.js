const fetch = require('node-fetch');
const { Client, Intents, MessageEmbed } = require('discord.js');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const API_URL = "https://data.vatsim.net/v3/vatsim-data.json";

// Store the online state of controllers
let controllersOnline = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  checkControllers();
  setInterval(checkControllers, 10000); // Check every 10 seconds, adjust as needed
});

async function checkControllers() {
  const response = await fetch(API_URL);
  const data = await response.json();

  const newControllersOnline = {};

  for (const controller of data.controllers) {
    const callsign = controller.callsign;
    const isRelevant = callsign.startsWith('VABB', 'VABF', 'VOGO', 'VOBL', 'VOMM');

    if (isRelevant) {
      newControllersOnline[callsign] = true;

      if (!controllersOnline[callsign]) {
        // This controller just came online
        const onlineEmbed = new MessageEmbed()
          .setColor('00FF00') // Green for online
          .setTitle(`${callsign} is online!`)
          .setTimestamp()
          .addFields(
            {name: 'Controller Name' ,value : `${controller.name}(${controller.cid}) `},
            {name: 'Rating', value: `${controller.rating}`},
            // {name: 'CID', value: `${controller.cid} is online!`},

          )

        client.channels.cache.get('CHANNEL_ID').send({ embeds: [onlineEmbed] });
      }
    }
  }

  for (const controllerCallsign in controllersOnline) {
    if (!newControllersOnline[controllerCallsign]) {
      // This controller just went offline
      const offlineEmbed = new MessageEmbed()
        .setColor('FF0000') // Red for offline
        .setTitle(`${controllerCallsign} is offline.`)
        .setTimestamp();

      client.channels.cache.get('CHANNEL_ID').send({ embeds: [offlineEmbed] });
    }
  }

  controllersOnline = newControllersOnline;
}

client.login('BOT_TOKEN'); // Replace with your actual bot token
