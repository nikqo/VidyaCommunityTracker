import fetch from 'node-fetch';

export class apiClient {
    constructor(headers) {
        this.headers = headers;
        this.urls = [];
    }

    async addUrl(url) {
        this.urls.push(url);
        return this;
    }
    
    async Fetch(index) {
        if (index => 0 && index < this.urls.length) {
            try {
                const response = await fetch(this.urls[index], {
                    headers: this.headers
                });
                if (response.ok) {
                    return await response.json();
                } else {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
                }
            } catch (error) {
                console.error(`Error fetching data from URL at index: ${index}: `, error);
                return null;
            }
        } else {
            console.error("Index out of bounds when trying to fetch URL");
            return null;
        }
    }
}

export function filter(filterStr, data) {
    let filteredData = {};
    for (const [key,value] of Object.entries(data)) {
        if (key.includes(filterStr) && !key.includes("overall")) {
            filteredData[key] = value;
        }
    }
    return filteredData;
}