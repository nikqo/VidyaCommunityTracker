import fetch from 'node-fetch';

export class apiClient {
    #data_url(player) {
        return `https://vidyascape.org/api/highscores/player/${player}`;
    }

    #tracker_url(player) {
        return `https://vidyascape.org/api/tracker/player/${player}?time=86400`;
    }

    constructor(headers) {
        this.headers = headers;
        this.player = null;
    }

    async getPlayer(player) {
        this.player = player;
        try {
            const dataResponse = await fetch(this.#data_url(this.player), {headers: this.headers});
            if (!dataResponse.ok) {
                throw new Error(`Failed to fetch data: ${dataResponse.status} ${dataResponse.statusText}`);
            }
            const data = await dataResponse.json();

            const trackerResponse = await fetch(this.#tracker_url(this.player), {headers: this.headers});
            if (!trackerResponse.ok) {
                throw new Error(`Failed to fetch data: ${trackerResponse.status} ${trackerResponse.statusText}`);
            }
            const tracker = await trackerResponse.json();

            return { data, tracker };
        } catch (error) {
            console.error('Error fetching player data:', error);
            return null;
        }
    }
}