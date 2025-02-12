// search.js

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/komiku/komikusearch', async (req, res) => {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }

        try {
            const response = await axios.get(`https://komiku.id/?s=${encodeURIComponent(query)}`);
            const $ = cheerio.load(response.data);
            let results = [];

            $(".ls4w .ls4").each((index, element) => {
                const url = "https://komiku.id" + $(element).find("a").attr("href");
                const title = $(element).find(".ls4j h3 a").text().trim();
                const thumbnail = $(element).find(".lazy").attr("data-src")?.split("?")[0].trim() || "";

                results.push({ title, url, thumbnail });
            });

            res.status(200).json({
                status: true,
                results
            });
        } catch (error) {
            console.error('Error searching for comics:', error.message);
            res.status(500).json({ status: false, error: 'Failed to search for comics' });
        }
    });
}
