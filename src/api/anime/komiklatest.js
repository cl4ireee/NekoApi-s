// latest.js

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/anime/latest', async (req, res) => {
        try {
            // Mengambil data dari situs komiku.id
            const response = await axios.get("https://komiku.id");
            const $ = cheerio.load(response.data);
            let komikList = [];
            
            // Mengambil informasi komik terbaru
            $("#Terbaru .ls4w .ls4").each((index, element) => {
                const url = "https://komiku.id" + $(element).find("a").attr("href");
                const title = $(element).find(".ls4j h3 a").text().trim();
                const release = $(element).find(".ls4j .ls4s").text().trim().split(" ").slice(2).join(' ').trim();
                const chapter = $(element).find(".ls4j .ls24").text().trim().split("Chapter")[1]?.trim() || "N/A"; // Menangani jika chapter tidak ada
                const thumbnail = $(element).find(".lazy").attr("data-src")?.split("?")[0].trim() || ""; // Menangani jika thumbnail tidak ada

                // Menambahkan objek komik ke array
                komikList.push({ title, release, chapter, thumbnail, url });
            });
            
            // Mengembalikan respons dengan status 200 dan data komik terbaru
            res.status(200).json(komikList);
        } catch (error) {
            // Menangani kesalahan dan mengembalikan respons dengan status 500
            console.error('Error fetching latest manga:', error.message); // Log kesalahan di server
            res.status(500).json({ error: 'Failed to fetch latest manga' });
        }
    });
}
