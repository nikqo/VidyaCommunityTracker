export class EmbedBuilder {
    constructor() {
        this.embed = {};
    }

    setColor(color) {
        this.embed.color = color;
        return this;
    }

    setTitle(title) {
        this.embed.title = title;
        return this;
    }

    setUrl(url) {
        this.embed.url = url;
        return this;
    }

    setAuthor(name, icon_url, url) {
        this.embed.author = { name, icon_url, url };
        return this;
    }

    setDescription(description) {
        this.embed.description = description;
        return this;
    }

    setThumbnail(url) {
        this.embed.thumbnail = { url };
        return this;
    }

    addField(name, value, inline) {
        if (!this.embed.fields) {
            this.embed.fields = [];
        }
        this.embed.fields.push({name, value, inline});
        return this;
    }

    setImage(url) {
        this.embed.image = { url };
        return this;
    }

    setTimestamp() {
        this.embed.timestamp = new Date().toISOString();
        return this;
    }

    setFooter(text, icon_url) {
        this.embed.footer = { text, icon_url };
        return this;
    }

    build() {
        return { ...this.embed };
    }
}