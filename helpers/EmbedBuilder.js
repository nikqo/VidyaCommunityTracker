export class EmbedBuilder {
    constructor() {
        this.embed = {};
    }

    setColor(color) {
        const hexColorPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexColorPattern.test(color)) {
            throw new Error(`Invalid color format. Color format must be a hex value (e.g. #FF0000).`)
        }
    
        this.embed.color = parseInt(color.replace('#', ''), 16);
        return this;
    }
    

    setTitle(title) {
        if (!title) {
            throw new Error(`Title constructor called but no title provided.`);
        }

        this.embed.title = title;
        return this;
    }

    setUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error(`Invalid URL format.`);
        }

        this.embed.url = url;
        return this;
    }

    setAuthor(name, icon_url = '', url = '') {
        if (!name) {
            throw new Error(`Author constructor called but no name provided.`);
        }

        this.embed.author = { name, icon_url, url };
        return this;
    }

    setDescription(description) {
        this.embed.description = description;
        return this;
    }

    setThumbnail(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error(`Invalid URL format.`);
        }

        this.embed.thumbnail = { url };
        return this;
    }

    addField(name, value, inline = false) {
        if (!name || !value) {
            throw new Error(`addField called but no name or value provided.`);
        }

        if (!this.embed.fields) {
            this.embed.fields = [];
        }

        if (this.embed.fields.length >= 25) {
            throw new Error(`Embed fields limit reached (25).`);
        }

        this.embed.fields.push({ name, value, inline });
    }

    setImage(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new Error(`Invalid URL format.`);
        }

        this.embed.image = { url };
        return this;
    }

    setTimestamp(timestamp = new Date()) {
        this.embed.timestamp = timestamp.toISOString();
        return this;
    }

    setFooter(text, icon_url = '') {
        if (!text) {
            throw new Error(`Footer constructor called but no text provided.`);
        }

        this.embed.footer = { text, icon_url };
        return this;
    }

    build() {
        return [this.embed];
    }
}
