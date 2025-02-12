// latest.js

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/anime/latest', async (req, res) => {
        try {
            const response = await axios.get("https://komiku.id");
            const $ = cheerio.load(response.data);
            let array = [];
            
            $("#Terbaru .ls4w .ls4").each((a, i) => {
                let url = "https://komiku.id/" + $(i).find("a").attr("href");
                let title = $(i).find(".ls4j h3 a").text().trim();
                let release = $(i).find(".ls4j .ls4s").text().trim().split(" ").slice(2).join(' ').trim();
                let chapter = $(i).find(".ls4j .ls24").text().trim().split("Chapter")[1].trim();
                let thumbnail = $(i).find(".lazy").attr("data-src").split("?")[0].trim();
                array.push({ title, release, chapter, thumbnail, url });
            });
            
            res.status(200).json(array);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch latest manga' });
        }
    });
}
