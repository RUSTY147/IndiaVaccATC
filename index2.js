const fetch = require('node-fetch');
const {  Client, Intents, MessageActionRow, MessageButton,MessageEmbed } = require('discord.js');
const { ActivityType } = require('discord-api-types/v10');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

const API_URL = "https://data.vatsim.net/v3/vatsim-data.json";
const statusAPI = "https://network-status.vatsim.net/summary.json";
const TARGET_CHANNEL_ID = ''; //Channel ID

// Store the online state of the controllers
let controllersOnline = {};
let previousStatusData = null;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  checkControllers();
  setInterval(checkControllers, 10000); // Check every 10 seconds, adjust to your needs
  setInterval(checkStatus, 10000);
  client.user.setActivity({name:"INDIAN AIRSPACE " ,type: ActivityType.Watching,status: 'online' }) 
});

client.on('messageCreate', async message => {
  if (message.channel.id !== TARGET_CHANNEL_ID) return; // Only for your channel
  if (message.author.bot) return; // Ignore bots

  // Check: message must have ONLY image attachments
  if (message.attachments.size > 0) {
      const isAllImages = message.attachments.every(attachment =>
          attachment.contentType?.startsWith('image')
      );

      if (isAllImages) {
          try {
              await message.react('👍');
          } catch (error) {
              console.error('Failed to react to image:', error);
          }
      }
  }
});
async function checkStatus() {
  try {
    const response = await fetch(statusAPI);
    const data = await response.json();

    // Compare current data with previous data
    if (!previousStatusData || JSON.stringify(data) !== JSON.stringify(previousStatusData)) {
      


      const embed = new MessageEmbed()
        .setColor("#3498db")

        //.setTitle(`Page Status: ${data.page.status}`)
        .setDescription("**Incident Reports**")
        .addFields(
          //{ name: "Page Name", value: data.page.name },
          
          { name: "Active Incidents", value: data.activeIncidents.length.toString() },
          //{ name: "URL", value: data.page.url },

          
        );

      // Add active incidents as fields
       const incidentFields = data.activeIncidents.map((incident) => ({
         name: `Incident: ${incident.name}`,
         value: `ID: ${incident.id}\nStatus: ${incident.status}\nImpact: ${incident.impact}\nStarted: ${new Date(incident.started).toUTCString()}\n[More Info](${incident.url})`
       }));
       embed.addFields(incidentFields);

      // Replace "YOUR_STATUS_CHANNEL_ID" with your desired channel ID
      client.channels.cache.get("1025710467840229417").send({ embeds: [embed] });

      // Update previousStatusData
      previousStatusData = data;
    }
  } catch (error) {
    console.error("Error fetching status:", error);
  }
}

async function checkControllers() {
  const response = await fetch(API_URL);
  const data = await response.json();

  const newControllersOnline = {};
  const positionNames = {
    "VAAH_APP": "Ahmedabad Approach",
    "VAAH_ATIS": "Ahmedabad Information",
    "VAAH_CTR": "Ahmedabad Radar",
    "VAAH_GND": "Ahmedabad Ground",
    "VAAH_TWR": "Ahmedabad Tower",
    "VAAU_APP": "Aurangabad Approach",
    "VAAU_ATIS": "Aurangabad ATIS",
    "VAAU_TWR": "Aurangabad Tower",
    "VABB_APP": "Mumbai Approach",
    "VABB_ATIS": "Mumbai Information",
    "VABB_CTR": "Mumbai Control",
    "VABB_DEL": "Mumbai Delivery",
    "VABB_DEP": "Mumbai Departure",
    "VABB_GND": "Mumbai Ground",
    "VABB_TWR": "Mumbai Tower",
    "VABF_CTR": "Mumbai Control",
    "VABF_E_CTR": "Mumbai Control",
    "VABO_APP": "Vadodara Approach",
    "VABO_ATIS": "Vadodara Information",
    "VABO_TWR": "Vadodara Tower",
    "VABP_APP": "Bhopal Approach",
    "VABP_ATIS": "Bhopal Information",
    "VABP_TWR": "Bhopal Tower",
    "VABV_APP": "Bhavnagar Approach",
    "VABV_ATIS": "Bhavnagar Information",
    "VABV_TWR": "Bhavnagar Tower",
    "VABX_CTR": "Mumbai Oceanic",
    "VADN_TWR": "Daman Tower",
    "VAGD_APP": "Gondia Approach",
    "VAGD_TWR": "Gondia Tower",
    "VAID_APP": "Indore Approach",
    "VAID_ATIS": "Indore Information",
    "VAID_TWR": "Indore Tower",
    "VAJB_ATIS": "Jabalpur Information",
    "VAJB_TWR": "Jabalpur Tower",
    "VAJL_TWR": "Jalgaon Tower",
    "VAKE_TWR": "Kandla Tower",
    "VAKJ_TWR": "Khajuraho Tower",
    "VAKP_TWR": "Kolhapur Tower",
    "VAKS_TWR": "Keshod Tower",
    "VAMA_TWR": "Mundra Tower",
    "VANP_APP": "Nagpur Approach",
    "VANP_ATIS": "Nagpur Information",
    "VANP_CTR": "Nagpur Radar",
    "VANP_GND": "Nagpur Ground",
    "VANP_TWR": "Nagpur Tower",
    "VAOZ_APP": "Ozar Approach",
    "VAOZ_TWR": "Ozar Tower",
    "VAPO_APP": "Pune Approach",
    "VAPO_ATIS": "Pune Information",
    "VAPO_TWR": "Pune Tower",
    "VAPR_TWR": "Porbandar Tower",
    "VARK_APP": "Rajkot Approach",
    "VARK_ATIS": "Rajkot Information",
    "VARK_TWR": "Rajkot Tower",
    "VARP_TWR": "Raipur Tower",
    "VASD_TWR": "Shirdi Tower",
    "VASU_APP": "Surat Approach",
    "VASU_ATIS": "Surat Information",
    "VASU_TWR": "Surat Tower",
    "VAUD_APP": "Udaipur Approach",
    "VAUD_ATIS": "Udaipur Information",
    "VAUD_TWR": "Udaipur Tower",
    "VEAB_APP": "Prayagraj Approach",
    "VEAB_TWR": "Prayagraj Tower",
    "VEBN_APP": "Varanasi Approach",
    "VEBN_ATIS": "Varanasi Information",
    "VEBN_CTR": "Varanasi Control",
    "VEBN_TWR": "Varanasi Tower",
    "VEBS_APP": "Bhubaneswar Approach",
    "VEBS_ATIS": "Bhubaneswar Information",
    "VEBS_TWR": "Bhubaneswar Tower",
    "VEBU_TWR": "Bilaspur Tower",
    "VECC-B_CTR": "Kolkata Control",
    "VECC-E_CTR": "Kolkata Control",
    "VECC-G_CTR": "Kolkata Control",
    "VECC-N_CTR": "Kolkata Control",
    "VECC-R_CTR": "Kolkata Control",
    "VECC-W_CTR": "Kolkata Control",
    "VECC_APP": "Kolkata Approach",
    "VECC_ATIS": "Kolkata Information",
    "VECC_CTR": "Kolkata Control",
    "VECC_DEL": "Kolkata Delivery",
    "VECC_GND": "Kolkata Ground",
    "VECC_TWR": "Kolkata Tower",
    "VECF_CTR": "Kolkata Control",
    "VECX_CTR": "Kolkata Oceanic Control",
    "VEDG_APP": "Durgapur Approach",
    "VEDG_TWR": "Durgapur Tower",
    "VEDH_TWR": "Darbhanga Tower",
    "VEDO_APP": "Panagarh Approach",
    "VEDO_TWR": "Panagarh Tower",
    "VEGK_APP": "Gorakhpur Approach",
    "VEGK_ATIS": "Gorakhpur Information",
    "VEGK_TWR": "Gorakhpur Tower",
    "VEGY_ATIS": "Gaya Information",
    "VEGY_TWR": "Gaya Tower",
    "VEJH_TWR": "Jharsuguda Tower",
    "VEJR_TWR": "Jagdalpur Tower",
    "VEKI_TWR": "Kushinagar Tower",
    "VEKU_APP": "Kumbhirgram Approach",
    "VEPT_APP": "Patna Approach",
    "VEPT_ATIS": "Patna Information",
    "VEPT_TWR": "Patna Tower",
    "VERC_ATIS": "Ranchi Information",
    "VERC_TWR": "Ranchi Tower",
    "VEAT_APP": "Agartala Approach",
    "VEAT_ATIS": "Agartala Information",
    "VEAT_TWR": "Agartala Tower",
    "VEBD_APP": "Bogdogra Approach",
    "VEBI_ATIS": "Barapani Information",
    "VEBI_TWR": "Barapani Tower",
    "VECO_TWR": "Cooch Behar Tower",
    "VEGF_CTR": "Guwahati Flight Information Service",
    "VEGT_APP": "Guwahati Approach",
    "VEGT_ATIS": "Guwahati Information",
    "VEGT_GND": "Guwahati Ground",
    "VEGT_TWR": "Guwahati Tower",
    "VEHX_APP": "Hashimara Approach",
    "VEHX_CTR": "Hashimara Radar",
    "VEIM_ATIS": "Imphal Information",
    "VEIM_TWR": "Imphal Tower",
    "VEJT_TWR": "Jorhat Tower",
    "VEKU_TWR": "Silchar Tower",
    "VELP_TWR": "Lengpui Tower",
    "VELR_TWR": "Lilabari Tower",
    "VEMN_ATIS": "Dibrugarh Information",
    "VEMN_TWR": "Dibrugarh Tower",
    "VEMR_ATIS": "Dimapur Information",
    "VEMR_TWR": "Dimapur Tower",
    "VETZ_TWR": "Tezpur Tower",
    "VQXX_CTR": "Bhutan Control",
    "VIAG_APP": "Agra Approach",
    "VIAG_TWR": "Agra Tower",
    "VIAR_APP": "Amritsar Approach",
    "VIAR_ATIS": "Amritsar Terminal Information",
    "VIAR_TWR": "Amritsar Tower",
    "VIBR_ATIS": "Kullu Manali Terminal Information",
    "VIBR_TWR": "Kullu Manali Tower",
    "VIBT_TWR": "Bathinda Tower",
    "VIBY_TWR": "Bareilly Tower",
    "VICG_APP": "Chandigarh Approach",
    "VICG_ATIS": "Chandigarh Information",
    "VICG_TWR": "Chandigarh Tower",
    "VIDD_TWR": "Safdarjung Tower",
    "VIDF_CTR": "Delhi Control",
    "VIDN_ATIS": "Dehradun Terminal Information",
    "VIDN_TWR": "Dehradun Tower",
    "VIDP_1_APP": "Delhi Approach",
    "VIDP_2_APP": "Delhi Radar",
    "VIDP_ATIS": "Delhi Terminal Information",
    "VIDP_CTR": "Delhi Control",
    "VIDP_C_GND": "Delhi Central Ground",
    "VIDP_C_TWR": "Delhi Tower",
    "VIDP_DEL": "Delhi Delivery",
    "VIDP_DEP": "Delhi Departure",
    "VIDP_F_APP": "Delhi Arrival",
    "VIDP_GND": "Delhi Ground",
    "VIDP_N_GND": "Delhi North Ground",
    "VIDP_N_TWR": "Delhi North Tower",
    "VIDP_S_GND": "Delhi South Ground",
    "VIDP_S_TWR": "Delhi South Tower",
    "VIDP_TWR": "Delhi Tower",
    "VIGG_TWR": "Kangra Tower",
    "VIGR_TWR": "Gwalior Tower",
    "VIJO_APP": "Jodhpur Approach",
    "VIJO_ATIS": "Jodhpur Information",
    "VIJO_TWR": "Jodhpur Tower",
    "VIJP_APP": "Jaipur Approach",
    "VIJP_ATIS": "Jaipur Terminal Information",
    "VIJP_CTR": "Jaipur Control",
    "VIJP_TWR": "Jaipur Tower",
    "VIJR_TWR": "Jaisalmer Tower",
    "VIJU_TWR": "Satwari Tower",
    "VIKG_TWR": "Kishangarh Tower",
    "VIKL_TWR": "Kargil Tower",
    "VILD_TWR": "Ludhiana Tower",
    "VILH_ATIS": "Leh Information",
    "VILK_APP": "Lucknow Approach",
    "VILK_ATIS": "Lucknow Terminal Information",
    "VILK_CTR": "Lucknow Control",
    "VILK_TWR": "Lucknow Tower",
    "VIPK_TWR": "Pathankot Tower",
    "VIPT_TWR": "Pantnagar Tower",
    "VISM_TWR": "Shimla Tower",
    "VISR_APP": "Srinagar Approach",
    "VISR_ATIS": "Srinagar Information",
    "VISR_TWR": "Srinagar Tower",
    "VIUX_CTR": "Udhampur Control",
    "VOAT_TWR": "Agatti Tower",
    "VOBG_APP": "HAL Radar",
    "VOBG_ATIS": "HAL Information",
    "VOBG_P_APP": "HAL Precision",
    "VOBG_TWR": "HAL Tower",
    "VOBL_1_GND": "Bengaluru Ground",
    "VOBL_1_TWR": "Bengaluru Tower",
    "VOBL_APP": "Bengaluru Approach",
    "VOBL_ATIS": "Bengaluru Information",
    "VOBL_CTR": "Bengaluru Radar",
    "VOBL_DEL": "Bengaluru Delivery",
    "VOBL_F_APP": "Bengaluru Arrival",
    "VOBL_GND": "Bengaluru Ground",
    "VOBL_TWR": "Bengaluru Tower",
    "VOBM_TWR": "Belagavi Tower",
    "VOBR_APP": "Bidar Approach",
    "VOBR_TWR": "Bidar Tower",
    "VOBZ_ATIS": "Vijayawada Information",
    "VOBZ_TWR": "Vijayawada Tower",
    "VOCB_APP": "Coimbatore Approach",
    "VOCB_ATIS": "Coimbatore Information",
    "VOCB_TWR": "Coimbatore Tower",
    "VOCI_APP": "Cochin Approach",
    "VOCI_ATIS": "Cochin Information",
    "VOCI_CTR": "Cochin Control",
    "VOCI_GND": "Cochin Ground",
    "VOCI_TWR": "Cochin Tower",
    "VOCL_APP": "Calicut Approach",
    "VOCL_ATIS": "Calicut Information",
    "VOCL_GND": "Calicut Ground",
    "VOCL_TWR": "Calicut Tower",
    "VOCP_TWR": "Kadapa Tower",
    "VOGA_APP": "Mopa Approach",
    "VOGA_ATIS": "Mopa Information",
    "VOGA_GND": "Mopa Ground",
    "VOGA_TWR": "Mopa Tower",
    "VOGB_TWR": "Kalaburagi Tower",
    "VOGO_APP": "Dabolim Approach",
    "VOGO_ATIS": "Dabolim Information",
    "VOGO_GND": "Dabolim Ground",
    "VOGO_TWR": "Dabolim Tower",
    "VOHB_ATIS": "Hubli Information",
    "VOHB_TWR": "Hubli",
    "VOHS_APP": "Hyderabad Approach",
  "VOHS_ATIS": "Shamshabad Information",
  "VOHS_CTR": "Hyderabad Control",
  "VOHS_DEL": "Shamshabad Delivery",
  "VOHS_GND": "Shamshabad Ground",
  "VOHS_TWR": "Shamshabad Tower",
  "VOHY_ATIS": "Begumpet Information",
  "VOHY_TWR": "Begumpet Tower",
  "VOJV_TWR": "Jindal Vijayanagar Tower",
  "VOKN_APP": "Kannur Approach",
  "VOKN_ATIS": "Kannur Information",
  "VOKN_TWR": "Kannur Tower",
  "VOMD_APP": "Madurai Approach",
  "VOMD_ATIS": "Madurai Information",
  "VOMD_TWR": "Madurai Tower",
  "VOMF_B_CTR": "Chennai Control",
  "VOMF_CTR": "Chennai Control",
  "VOMF_C_CTR": "Chennai Control",
  "VOMF_D_CTR": "Chennai Control",
  "VOMF_H_CTR": "Chennai Control",
  "VOMF_M_CTR": "Chennai Control",
  "VOMF_V_CTR": "Chennai Control",
  "VOMF_W_CTR": "Chennai Control",
  "VOML_APP": "Mangalore Approach",
  "VOML_ATIS": "Mangalore Information",
  "VOML_CTR": "Mangalore Radar",
  "VOML_GND": "Mangalore Ground",
  "VOML_TWR": "Mangalore Tower",
  "VOMM_APP": "Chennai Approach",
  "VOMM_ATIS": "Chennai Information",
  "VOMM_CTR": "Chennai Radar",
  "VOMM_GND": "Chennai Ground",
  "VOMM_S_CTR": "Chennai Radar",
  "VOMM_TWR": "Chennai Tower",
  "VOMX_CTR": "Chennai Radio",
  "VOMY_ATIS": "Mysore Information",
  "VOMY_TWR": "Mysore Tower",
  "VOPB_APP": "Port Blair Approach",
  "VOPB_ATIS": "Port Blair Information",
  "VOPB_TWR": "Port Blair Tower",
  "VOPC_TWR": "Puducherry Tower",
  "VOPN_TWR": "Sri Sathya Sai Tower",
  "VORY_TWR": "Rajahmundry Tower",
  "VOSM_TWR": "Salem Tower",
  "VOSR_TWR": "Sindhudurg Tower",
  "VOTK_TWR": "Tuticorin Tower",
  "VOTP_ATIS": "Tirupati Information",
  "VOTP_TWR": "Tirupati Tower",
  "VOTR_APP": "Tiruchirappalli Approach",
  "VOTR_ATIS": "Tiruchirappalli Information",
  "VOTR_TWR": "Tiruchirappalli Tower",
  "VOTV_APP": "Thiruvananthapuram Approach",
  "VOTV_ATIS": "Thiruvananthapuram Information",
  "VOTV_CTR": "Thiruvananthapuram Radar",
  "VOTV_GND": "Thiruvananthapuram Ground",
  "VOTV_TWR": "Thiruvananthapuram Tower",
  "VOVZ_APP": "Vishakhapatnam Approach",
  "VOVZ_TWR": "Vishakhapatnam Tower",
    // Add more mappings as needed
  };
  const ratings = {
    "-1": { short: "INA", long: "Inactive" },
    "0": { short: "SUS", long: "Suspended" },
    "1": { short: "OBS", long: "Pilot/Observer" },
    "2": { short: "S1", long: "Tower Trainee" },
    "3": { short: "S2", long: "Tower Controller" },
    "4": { short: "S3", long: "TMA Controller" },
    "5": { short: "C1", long: "Enroute Controller" },
    "6": { short: "C2", long: "Senior Controller" },
    "7": { short: "C3", long: "Senior Controller" },
    "8": { short: "I1", long: "Instructor" },
    "9": { short: "I2", long: "Senior Instructor" },
    "10": { short: "I3", long: "Senior Instructor" },
    "11": { short: "SUP", long: "Supervisor" },
    "12": { short: "ADM", long: "Administrator" },
  };

  for (const controller of data.controllers) {
    if (controller.callsign.startsWith('VA') || 
    controller.callsign.startsWith('VE') || 
    controller.callsign.startsWith('VO' )|| controller.callsign.startsWith('VI') )
 { // Specific airport code, replace 'VO/VA/VE/VI' with your desired code
      newControllersOnline[controller.callsign] = true;
      if (!controllersOnline[controller.callsign]) {
        // This controller just came online
        const positionName = positionNames[controller.callsign] || controller.callsign;
        const controllerRating = ratings[controller.rating];


        const embed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle(`${positionName} (${controller.callsign}) is online!`)
          //.setDescription('This controller just came online!.')
          .addFields(
            { name: "Controller Name",
                  value: `**[${controller.name}](https://stats.vatsim.net/stats/${controller.cid}) (${controller.cid})**`,
                  inline: true },
            { name: 'Rating', value: `${controllerRating.short} - ${controllerRating.long}` },

            // {name: 'CID', value: `${controller.cid} is online!`},

          )
          .setTimestamp()
          .setFooter({ text: 'India vACC', iconURL: 'https://indiavacc.org/wp-content/uploads/2021/08/Vatsim_India_Logo-.png' });

         const button = new MessageButton()
            .setStyle('LINK') // Can be PRIMARY, SECONDARY, SUCCESS, DANGER, or LINK
            .setLabel('Feedback')
            .setURL(`https://hq.vatwa.net/atc/feedback?cid=${controller.cid}`);
          const row = new MessageActionRow().addComponents(button);
        client.channels.cache
          .get("YOUR_CHANNEL_ID") //Channel ID
          .send({ embeds: [embed],components: [row] });
        client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
      }
    }
  }

  for (const controllerCallsign in controllersOnline) {
    
    if (!newControllersOnline[controllerCallsign]) {
      // This controller just went offline
      //const positionName = positionNames[controller.callsign] || controller.callsign;
      const positionName = positionNames[controllerCallsign] || controllerCallsign;
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle(` ${positionName} ${controllerCallsign} is offline.`)
        //.setDescription('This controller just went offline.')
        .setTimestamp()
        .setFooter({ text: 'India vACC', iconURL: 'https://indiavacc.org/wp-content/uploads/2021/08/Vatsim_India_Logo-.png' });
       const button = new MessageButton()
            .setStyle('LINK') // Can be PRIMARY, SECONDARY, SUCCESS, DANGER, or LINK
            .setLabel('Feedback')
            .setURL(`https://hq.vatwa.net/atc/feedback?cid=${controller.cid}`);
          const row = new MessageActionRow().addComponents(button);
        client.channels.cache
          .get("YOUR_CHANNEL_ID")
          .send({ embeds: [embed],components: [row] });
      client.channels.cache.get('YOUR_CHANNEL_ID').send({ embeds: [embed] }); // replace with your channel id
    }
  }

  controllersOnline = newControllersOnline;
}

client.login('YOUR_BOT_TOKEN,'); // replace with your bot token
