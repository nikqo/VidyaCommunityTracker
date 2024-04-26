// modularized some shit
import { apiClient, filter } from './helpers/apiClient.js';
import { EmbedBuilder } from './helpers/EmbedBuilder.js';

async function compile_payload() {
  let skills = [];
  let fields = [];

  const player = 'community';
  const highscoresUrl = `https://vidyascape.org/api/highscores/player/${player}`;
  const trackerUrl = `https://vidyascape.org/api/tracker/player/${player}?time=86400`;

  // these are big and ugly so i shoved them inside of .json containers to import them here. looks cleaner i guess
  const emojis = await import('./storage/skills.json', { assert: { type: 'json'} });
  const headers = await import('./storage/headers.json', { assert: { type: 'json' } });

  // new instace of api client. just think of it as "fetch". 
  let client = new apiClient(headers)
  client.addUrl(highscoresUrl);
  client.addUrl(trackerUrl);

  // complete unfiltered json returns. highscoresData has xp, lvl, everything in it. the Filter functions
  // on line 29,30,31 are there to automatically construct the skills array.
  const [highscoresData, trackerData] = await Promise.all([
    client.Fetch(0),
    client.Fetch(1)
  ]);

  const [highscoresDataLvl, highscoresDataXP, trackerData_f] = [
    filter("_lvl", await highscoresData),
    filter("_xp", await highscoresData),
    filter("_diff", await trackerData)
  ];

  // took the json returns from highscoresDataLvl & trackerData_f and mapped them into skills so you don't have that
  // disgusting large array at the top of the document. lot easier to read imo
  skills = Object.keys(highscoresDataLvl).map(key => {
    const skillname = key.replace('_lvl', '');
    const diffKey = skillname.toLowerCase() + '_diff';
    const level = highscoresDataLvl[key];
    const diff = trackerData_f[diffKey];
    const emoji = emojis.default[skillname.toLowerCase()] || '';

    return {
      name: skillname.charAt(0).toUpperCase() + skillname.slice(1),
      level: level,
      diff: diff,
      emoji: emoji
    }
  });

  // manually pushing overall, i assumed you want it at the last slot so i excluded "overall" in the filter
  // defined inside of apiClient.js so i can manually push it here.
  skills.push({
    name: 'Overall',
    level: highscoresData.overall_lvl,
    diff: trackerData.overall_diff,
    emoji: emojis.default['overall'] || ''
  });

  // this function maps the fields[] into a format the embed expects, havent really touched its logic since it works fine
  function skill_field(skillName, currentLevel, xpDiff, emoji) {
    const diffText = xpDiff !== undefined ? (xpDiff > 0 ? `+${xpDiff}`: xpDiff.toString()): 'Unkown';
    return {
      name: `${emoji} ${skillName} ${currentLevel}`,
      value: `${diffText} XP gained today`,
      inline: true
    };
  }

  // pushing the skills[] array into the fields[] array using skill_field function
  skills.forEach(skill => {
    fields.push(skill_field(skill.name, skill.level, skill.diff, skill.emoji));
  })

  // creating the embed here. if you want a complete check at everything you can add, look inside of EmbedBuilder.js
  let embed = new EmbedBuilder();
  embed.setTitle("Vidya Community Tracker TBD");
  embed.setColor(0x6cf088); // green like the goddamn gnome ffucker
  
  // shove that shit in there again b
  fields.forEach(field => {
    embed.addField(field.name, field.value, field.inline);
  });

  // whenever the code gets called, just delete this line if you don't want a timestamp
  embed.setTimestamp(new Date().toISOString()); 

  // embed.build() compiles everything you did and returns it properly to be fed
  let payload = {
    embeds: [embed.build()]
  }

  return payload
}

// i deleted 'main' because javascript doesn't require it. we're just going to shove it inside of here then call it.
// aside from that this mostly remains unchanged. i also shoved webhook_url into here because it's not used anywhere else in the code so there's
// no reason for it to occupy the global namespace
async function deliver_payload() {
  let payload = await compile_payload();
  const webhook_url = "https://discord.com/api/webhooks/1233062280925806622/RqJgqFh4L5iOfQQwzCUBjQTmFRKYY_CQAwwA78LOlQmn32sLruDLtqTQX3s1_xuJV19l";

  try {
    const response = await fetch(webhook_url + "?wait=true", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('Embedded message posted successfully');
    } else {
      console.log('Failed to post message: ', response.status, response.statusText)
    }
  } catch (error) {
    console.error('error posting message: ', error);
  }
}

deliver_payload();
