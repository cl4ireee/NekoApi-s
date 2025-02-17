const axios = require("axios");
const cheerio = require("cheerio");

async function anichinSearch(query) {
    try {
        let { data } = await axios.get(`https://anichin.xyz/?s=${encodeURIComponent(query)}`);
        let $ = cheerio.load(data);

        let result = [];
        $(".listupd .bsx a").each((i, el) => {
            let title = $(el).attr("title");
            let link = $(el).attr("href");
            let episode = $(el).find(".bt .epx").text().trim();
            let type = $(el).find(".typez").text().trim();
            let image = $(el).find("img").attr("data-lazy-src") || $(el).find("img").attr("src");

            result.push({ title, episode, type, image, link });
        });

        return result;
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        return [];
    }
}

module.exports = function (app) {
    // Endpoint untuk pencarian anime
    app.get("/anime/anichin-search", async (req, res) => {
        const { q } = req.query; // Mengganti 'query' menjadi 'q'

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            const results = await anichinSearch(q); // Menggunakan 'q' sebagai parameter
            res.status(200).json({ status: true, data: results });
        } catch (error) {
            console.error("Error fetching anime search results:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime search results" });
        }
    });
};
