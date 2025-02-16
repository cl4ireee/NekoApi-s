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

// Fungsi untuk mendaftarkan endpoint API
module.exports.registerHooksAPI = (app) => {
    app.get("/search/hooks", async (req, res) => {
        const { q } = req.query; // Ganti `title` dengan `q`

        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        const results = await Hooks(q); // Gunakan `q` sebagai parameter pencarian
        res.json(results);
    });
};
