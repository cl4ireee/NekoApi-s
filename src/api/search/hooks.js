const axios = require("axios");
const cheerio = require("cheerio");

const Hooks = async (memeTitle) => {
    try {
        let { data } = await axios.get(`https://thetransitionalhooks.com/?vgp_search=${encodeURIComponent(memeTitle)}`);
        let $ = cheerio.load(data);

        let results = [];
        $(".vgp-video-item").each((i, el) => {
            let title = $(el).find("h3").text().trim();
            let downloadUrl = $(el).find(".vgp-download-btn").attr("href");

            if (downloadUrl) {
                results.push({ title, download: downloadUrl });
            }
        });

        return results;
    } catch (error) {
        console.error("Error scraping:", error.message);
        return [];
    }
};

// Ekspor langsung tanpa `const`
module.exports = (app) => {
    app.get('/search/hooks', async (req, res) => {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({ error: "Query parameter 'q' is required" });
            }

            const results = await Hooks(q);
            res.setHeader("Content-Type", "application/json");
            res.json(results);
        } catch (error) {
            console.error("API Error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
};
