export function filterResponse(filterStr, data) {
    return Object.keys(data).reduce((filteredData, key) => {
        if (key.includes(filterStr)) {
            filteredData[key] = data[key];
        }
        return filteredData;
    }, {});
}

export async function format_fields(skill, cache, records) {
    const { name, level, diff, emoji } = skill;
    const cacheLevel = cache[`${name.toLowerCase()}_lvl`];
    const levels_gained = level - cacheLevel;
    const levelsGainedText = levels_gained > 0 ? `+${levels_gained}` : '';

    return {
        name: `${emoji} ${name} ${level} ${levelsGainedText}`,
        value: `+${diff.toLocaleString()} XP gained.`,
        inline: true
    }
}

export async function format_field(skill, cache, records, timeSet) {
    const { name, level, diff, emoji } = skill;
    const cacheLevel = cache[`${name.toLowerCase()}_lvl`];
    const levels_gained = level - cacheLevel;
    const levelsGainedText = levels_gained > 0 ? `+${levels_gained}` : '';

    const skillRecord = records[timeSet][`${name.toLowerCase()}_diff`] ? records[timeSet][`${name.toLowerCase()}_diff`] : 0;

    const recordXP = skillRecord ? skillRecord: 0;
    const isRecordBroken = diff > recordXP;

    const newValue = diff > recordXP ? `+${diff.toLocaleString()} XP gained 🏆` : `+${diff.toLocaleString()} XP gained.`;

    return {
        field: {
            name: `${emoji} ${name} ${level} ${levelsGainedText}`,
            value: newValue,
            inline: true
        },
        isRecordBroken: isRecordBroken
    }
}

export async function format_body(type) {
    const titleSuffixOptions = {
        '86400': 'Daily',   
        '604800': 'Weekly',
        '2592000': 'Monthly'
    };

    const descriptionIntroOptions = {
        '86400': `Daily Community Report is here!\n\u200E\nHere are the results: `,
        '604800': `Weekly Community Report is here!\n\u200E\nHere are the results: `,
        '2592000': `Monthly Community Report is here!\n\u200E\nHere are the results: `
    };

    const titleSuffix = titleSuffixOptions[type] || 'Daily';
    const descriptionIntro = descriptionIntroOptions[type] || 'Daily Community Report is here!\n\u200E\nHere are the results: ';
    const nextUpdateTime = new Date();
    nextUpdateTime.setDate(nextUpdateTime.getDate() + (type === 86400 ? 1 : type === 604800 ? 7 : 30));

    return { titleSuffix, descriptionIntro, nextUpdateTime };
}

