const fetch = require('node-fetch');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { ActivityType } = require('discord-api-types/v10');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const API_URL = "https://data.vatsim.net/v3/vatsim-data.json";

// Store the online state of the controllers
let controllersOnline = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  checkControllers();
  setInterval(checkControllers, 10000); // Check every 10 seconds, adjust to your needs
  client.user.setActivity({name:"INDIAN AIRSPACE " ,type: ActivityType.Watching,status: 'online' }) 
});

async function checkControllers() {
  const response = await fetch(API_URL);
  const data = await response.json();

  const newControllersOnline = {};
  const positionNames = {
    "VABB_TWR": "Mumbai Tower",
    "VABB_T_APP": "Mumbai Approach",
    "VABB_DEL": "Mumbai Delivery",
    "VOBL_TWR": "Benguluru Tower"
    // Add more mappings as needed
  };

  for (const controller of data.controllers) {
    if (controller.callsign.startsWith('VA') || 
    controller.callsign.startsWith('VE') || 
    controller.callsign.startsWith('VO' )|| controller.callsign.startsWith('VI') )
 { // Specific airport code, replace 'EG' with your desired code
      newControllersOnline[controller.callsign] = true;
      if (!controllersOnline[controller.callsign]) {
        // This controller just came online
        const positionName = positionNames[controller.callsign] || controller.callsign;

        const embed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle(`${positionName} (${controller.callsign}) is online!`)
          //.setDescription('This controller just came online.')
          .addFields(
            {name: 'Controller Name' ,value : `${controller.name}(${controller.cid}) `},
            {name: 'Rating', value: `${controller.rating}`},
            // {name: 'CID', value: `${controller.cid} is online!`},

          )
          .setTimestamp();
        client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
      }
    }
  }

  for (const controllerCallsign in controllersOnline) {
    
    if (!newControllersOnline[controllerCallsign]) {
      // This controller just went offline
      const positionName = positionNames[controller.callsign] || controller.callsign;
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle(`${positionName} ${controllerCallsign} is offline.`)
        .setDescription('This controller just went offline.')
        .setTimestamp();
      client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
    }
  }

  controllersOnline = newControllersOnline;
}

client.login('YOUR_BOT_TOKEN'); // replace with your bot token
