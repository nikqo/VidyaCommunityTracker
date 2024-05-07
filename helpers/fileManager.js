import { writeFile, readFile } from 'fs/promises';

const recordsPath = `./storage/records.json`;
const cachePath = `./storage/cache.json`;

async function readRecords(data, timeSet) {
    try { 
        const dataFromFile = await readFile(recordsPath, { encoding: 'utf8' });
        let existingRecords = JSON.parse(dataFromFile);

        let relevantRecords = existingRecords[timeSet];

        if (!relevantRecords) {
            relevantRecords = {};
        }

        Object.keys(data).forEach(key => {
            if (!relevantRecords[key]) {
                relevantRecords[key] = data[key];
            }
        });

        existingRecords[timeSet] = relevantRecords;

        return existingRecords;
    } catch (error) {
        console.error(`Error reading records: ${error.message}`);

        const diffs = Object.keys(data).reduce((acc, key) => {
            if (key.endsWith('_diff')) {
                acc[key] = data[key];
            }

            return acc;
        }, {});

        const intialRecords = {
            day: {},
            week: {},
            month: {}
        };

        intialRecords[timeSet] = diffs;

        await writeFile(recordsPath, JSON.stringify(intialRecords, null, 4), { encoding: 'utf8' });
        return intialRecords;
    }
}

async function writeRecords(timeset, records) {
    try {
        const dataFromFile = await readFile(recordsPath, { encoding: 'utf8' });
        let existingRecords = JSON.parse(dataFromFile);

        if (!existingRecords[timeset]) {
            existingRecords[timeset] = {};
        }

        Object.keys(records[timeset]).forEach(key => {
            if (key.endsWith('_diff')) {
                existingRecords[timeset][key] = records[timeset][key];
            }
        });

        await writeFile(recordsPath, JSON.stringify(existingRecords, null, 4), { encoding: 'utf8' });
    } catch ( err ) {
        console.error(`Error writing records: ${err.message}`);
    
    }
}

async function readCache(backup_cache) {
    try {
        const data = await readFile(cachePath, { encoding: 'utf8' });
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading cache: ${error.message}`);
        await writeCache(backup_cache);

        return backup_cache;
    }
}

async function writeCache(cache) {
    try {
        await writeFile(cachePath, JSON.stringify(cache, null, 4), { encoding: 'utf8' });
    } catch (error) {
        console.error(`Error writing cache: ${error.message}`);
    }
}

export { readRecords, writeRecords, readCache, writeCache}