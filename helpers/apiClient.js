import fetch from 'node-fetch'

const TimePeriod = Object.freeze({
    DAY: '86400',
    WEEK: '604800',
    MONTH: '2592000'
});

function apiUrl(path) {
    return `https://vidyascape.org/api/${path}`;
}

class ApiClient {
    constructor(headers) {
        this.headers = headers;
    }

    async #fetchUrl(url) {
        const response = await fetch(url, { headers: this.headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        return response.json();
    }

    async getPlayer(player, time = TimePeriod.DAY) {
        try {
            const data = await this.#fetchUrl(apiUrl(`highscores/player/${player}`));
            const tracker = await this.#fetchUrl(apiUrl(`tracker/player/${player}?time=${time}`));
            return { data, tracker };
        } catch (err) {
            console.error(`Error fetching player data: ${err}`);
            throw err;
        }
    }

    async getLeaderboard(type) {
        try {
            return await this.#fetchUrl(apiUrl(`tracker/skill/overall/1?time=${type}`));
        } catch (err) {
            console.error(`Error fetching leaderboard data: ${err}`);
            throw err;
        }
    }
}

export { ApiClient, TimePeriod };