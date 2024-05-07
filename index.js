import { ApiClient } from './helpers/apiClient.js';
import { EmbedBuilder } from './helpers/embedBuilder.js';
import { scheduleTask } from './helpers/scheduler.js';
import { readRecords, readCache, writeRecords } from './helpers/fileManager.js';
import { writeFile, readFile } from 'fs/promises';
import { filterResponse, format_field, format_body } from './helpers/formatter.js';

const env_param = process.env.TYPE || '2592000';

const map_to_string = {
    '86400': 'day',
    '604800': 'week',
    '2592000': 'month'
}


async function compile_payload() {
    const headers = await JSON.parse(await readFile(`./storage/headers.json`, { encoding: 'utf8' }));
    const client = new ApiClient(headers);
    let newRecordPing = '';
    
    console.log(env_param);
    const community_data = await client.getPlayer('community', env_param);
    const records = await readRecords(community_data.tracker, map_to_string[env_param]);
    const emojis = await JSON.parse(await readFile(`./storage/skills.json`, { encoding: 'utf8' }));

    const cache = await readCache(community_data);

    const [highscoresData, trackerData] = await Promise.all([
        filterResponse("_lvl", community_data.data),
        filterResponse("_diff", community_data.tracker)
    ]);

    let skills = [];
    let fields = [];
    let new_record = false;

    const body = await format_body(env_param);

    skills = Object.keys(highscoresData).map(key => {
        const skill = key.replace('_lvl', '');
        const skillLower = skill.toLowerCase();

        return {
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            level: highscoresData[key],
            diff: trackerData[`${skillLower}_diff`],
            emoji: emojis[skillLower]
        }
    });

    fields = await Promise.all(skills.map(async skill => {
        return await format_field(skill, cache, records, map_to_string[env_param]);
    }));

    new_record = fields.some(field => field.isRecordBroken);
    fields = fields.map(field => field.field);
    
    const period = map_to_string[env_param];

    if (new_record) {
        newRecordPing = `<@155803196382511104> New record set!`;

        records[period].overall_diff = community_data.tracker.overall_diff;

        Object.keys(trackerData).forEach(key => {
            records[period][key] = trackerData[key];
        });

        await writeRecords(period, records);
    }

    let embed = new EmbedBuilder()
        .setTitle(`Community Report - ${body.titleSuffix}`)
        .setDescription(`${body.descriptionIntro}`)
        .setTimestamp()
        .setFooter(`Next update: ${body.nextUpdateTime.toUTCString()}`);

    fields.forEach(field => {
        embed.addField(field.name, field.value, field.inline);
    })

    const embedObject = embed.build();

    if (new_record) {
        newRecordPing = `<@155803196382511104> New record set!`;
    }

    const thresholds = [
        { limit: 10000000, message: "Oh my god! Somebody got more than 10 million experience! It's time to touch some grass." },
        { limit: 1000000, message: "More than 1,000,000 exp gained. Remarkable." },
        { limit: 100000, message: "More than 100,000 exp gained. Great work!" },
        { limit: 10000, message: "More than 10,000 exp gained. At least somebody tried." },
        { limit: 1, message: "Less than 10,000 exp gained. We can try harder than that." },
        { limit: 0, message: "No xp gained. We can do better than that." }
    ];


    let xpMessage = thresholds.find(threshold => community_data.tracker.overall_diff >= threshold.limit).message;


    const payload = {
        content: `${newRecordPing} \n\n${xpMessage}`,
        embeds: embedObject
    };

    return payload;

}

async function main() {
    let payload = await compile_payload();
    const webhook_url = "https://discord.com/api/webhooks/1233062280925806622/RqJgqFh4L5iOfQQwzCUBjQTmFRKYY_CQAwwA78LOlQmn32sLruDLtqTQX3s1_xuJV19l";

    try {
        const response = await fetch(webhook_url + '?wait=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            
        });

        if (response.ok) {
            console.log(`Webhook sent successfully.`);
            scheduleTask(env_param);
        } else {
            console.error(`Failed to send webhook: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error sending webhook: ${error.message}`);
    }
}

main();