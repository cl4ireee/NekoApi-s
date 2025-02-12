const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/komik/komikusearch', async (req, res) => {
        const { q } = req.query; // Mengambil query dari parameter

        if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }

        try {
            const response = await axios.get(`https://komiku.id/?s=${encodeURIComponent(q)}`);
            const $ = cheerio.load(response.data);
            let results = [];

            // Mengambil elemen yang sesuai dengan hasil pencarian
            $(".ls4w .ls4").each((index, element) => {
                const url = "https://komiku.id" + $(element).find("a").attr("href");
                const title = $(element).find(".ls4j h3 a").text().trim();
                const thumbnail = $(element).find(".lazy").attr("data-src")?.split("?")[0].trim() || "";
                const synopsis = $(element).find(".ls4j p").text().trim(); // Mengambil sinopsis jika ada

                results.push({ title, url, thumbnail, synopsis });
            });

            // Jika tidak ada hasil, kembalikan array kosong
            if (results.length === 0) {
                return res.status(200).json({
                    status: true,
                    results: []
                });
            }

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
