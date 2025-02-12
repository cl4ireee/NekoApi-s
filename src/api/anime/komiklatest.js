// latest.js

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/anime/latest', async (req, res) => {
        try {
            const response = await axios.get("https://komiku.id");
            const $ = cheerio.load(response.data);
            let komikList = [];
            
            $("#Terbaru .ls4w .ls4").each((index, element) => {
                const url = "https://komiku.id" + $(element).find("a").attr("href");
                const title = $(element).find(".ls4j h3 a").text().trim();
                const release = $(element).find(".ls4j .ls4s").text().trim().split(" ").slice(2).join(' ').trim();
                const chapter = $(element).find(".ls4j .ls24").text().trim().split("Chapter")[1]?.trim() || "N/A";
                const thumbnail = $(element).find(".lazy").attr("data-src")?.split("?")[0].trim() || "";

                komikList.push({ title, release, chapter, thumbnail, url });
            });
            
            // Mengembalikan respons dengan status dan hasil
            res.status(200).json({
                status: true,
                results: komikList // Mengembalikan daftar komik dalam results
            });
        } catch (error) {
            console.error('Error fetching latest manga:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch latest manga' });
        }
    });
}
