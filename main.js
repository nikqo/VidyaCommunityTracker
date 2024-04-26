import { apiClient } from './helpers/apiClient.js';
import { EmbedBuilder } from './helpers/EmbedBuilder.js';
import { writeFile } from 'fs';
import { exec } from 'child_process';
import fetch from 'node-fetch';

async function compile_payload() {
  let skills = [];
  let fields = [];
  let cache;

  const emojis = await import('./storage/skills.json', { assert: { type: 'json' } });
  const headers = await import('./storage/headers.json', { assert: { type: 'json' } });
  const client = new apiClient(headers.default);
  const playerData = await client.getPlayer('community');

  try {
    cache = await import('./storage/cache.json', { assert: { type: 'json' } });
    cache = filter("_lvl", cache.default);
  } catch (err) {
    console.error(`Error reading cache: ${err}`);
    cache = {};
  };

  const [highscoresData, trackerData] = await Promise.all([
    filter("_lvl", playerData.data),
    filter("_diff", playerData.tracker)
  ]);

  skills = Object.keys(highscoresData).map(key => {
    const skill = key.replace('_lvl', '');
    const diffKey = skill.toLowerCase() + '_diff';
    const level = highscoresData[key];
    const diff = trackerData[diffKey];
    const emoji = emojis.default[skill.toLowerCase()];

    return {
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      level: level,
      diff: diff,
      emoji: emoji
    }
  });

  skills.push({
    name: 'Overall XP',
    level: '',
    diff: playerData.tracker.overall_diff,
    emoji: emojis.default['overall'] || ''
  });

  function createSkillField(skill) {
    const { name, level, diff, emoji } = skill;

    let levels_gained = 0;
    const cacheLevel = cache[`${name.toLowerCase()}_lvl`];

    if (cacheLevel) {
      levels_gained = level - cacheLevel;
    }

    const levelsGainedText = levels_gained > 0 ? ` (+${levels_gained})` : '';
    const fieldName = `${emoji} ${name}${levelsGainedText}`;

    const field_value = `+${diff} XP gained.`;

    return {
      name: fieldName,
      value: field_value,
      inline: true
    };
  }

  skills.forEach(skill => {
    fields.push(createSkillField(skill));
  });

  let embed = new EmbedBuilder();
  embed.setTitle(`Vidyascape Community Tracker`);
  embed.setColor(0x6cf088);
  embed.setDescription(`Keeping track of the daily gains of the "Community" account\n‎\nHere is today's report:`);
  embed.setImage("https://media.discordapp.net/attachments/1081317409689968751/1233422660424433705/image.png?ex=662d09de&is=662bb85e&hm=238c886158fccc6effaf939d5ad1518fffae3885aa6ffb1793bbe8d571b73126&=&format=webp&quality=lossless");

  fields.forEach(field => {
    embed.addField(field.name, field.value, field.inline);
  })

  // string contains [U+200E] character to force a new line
  let totalLevelText = `${emojis.default['overall']} ${playerData.data.overall_lvl}`;
  if (playerData.tracker.overall_diff <= 0) {
    totalLevelText += '\n‎\nNo xp gained today. We can do better than that.';
  } else if (playerData.tracker.overall_diff >= 1000000) {
      totalLevelText += '\n‎\nMore than 1,000,000 exp gained today! Remarkable.';
  } else if (playerData.tracker.overall_diff >= 100000) {
      totalLevelText += '\n‎\nMore than 100,000 exp gained today. Great work!';
  } else if (playerData.tracker.overall_diff >= 10000) {
      totalLevelText += '\n‎\nMore than 10,000 exp gained today. At least somebody tried.';
  }

  writeFile('./storage/cache.json', JSON.stringify(playerData.data, null, 2), (err) => {
    if (err) {
      console.error(`Error writing cache: ${err}`);
    }
  });

  embed.addField('Total Level', totalLevelText, false);
  embed.setTimestamp();

  let payload = {
    embeds: [embed.build()]
  }

  return payload
}

async function deliver_payload() {
  let payload = await compile_payload();
  const webhook_url = "https://discord.com/api/webhooks/1233062280925806622/RqJgqFh4L5iOfQQwzCUBjQTmFRKYY_CQAwwA78LOlQmn32sLruDLtqTQX3s1_xuJV19l";
  
  const scheduleTask = () => {
    const command = `schtasks /create /tn "RunScript" /tr "node main.js" /sc daily /st 19:00 /f`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error scheduling task: ", error);
        return;
      }

      if (stderr) {
        console.error("Error scheduling task: ", stderr);
        return;
      }

      console.log(`Task Scheduled: ${stdout}`);
    });
  };

  try {
    const response = await fetch(webhook_url + "?wait=true", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('Embedded message posted successfully');
      scheduleTask();
    } else {
      console.log('Failed to post message: ', response.status, response.statusText)
    }
  } catch (error) {
    console.error('error posting message: ', error);
  }
}

function filter(filterStr, data) {
  let filteredData = {};
  for (const key in data) {
    if (key.includes(filterStr) && !key.includes('overall')) {
      filteredData[key] = data[key];
    }
  }

  return filteredData;
}

deliver_payload();