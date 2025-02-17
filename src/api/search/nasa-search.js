const axios = require("axios");
const cheerio = require("cheerio");

async function nasaGov(q) {
    try {
        let { data: s } = await axios.get(`https://www.nasa.gov/?search=${q}`);
        const $ = cheerio.load(s);
        const results = [];

        $("a.hds-search-result").each((_, el) => {
            const title = $(el).find(".hds-search-result-heading").text().trim();
            const url = $(el).attr("href");
            const excerpt = $(el).find(".hds-search-result-excerpt").text().trim();
            const image = $(el).find(".hds-search-result-thumbnail img").attr("src");

            results.push({
                title,
                url,
                excerpt,
                image: image ? `https://www.nasa.gov${image}` : null,
            });
        });

        return results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Ekspor langsung di dalam deklarasi fungsi
module.exports = function setupNasaGovAPI(app) {
    app.get("/search/nasa-search", async (req, res) => {
        const q = req.query.q; // Menggunakan `q` sebagai parameter
        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        const results = await nasaGov(q);
        res.json(results);
    });
};
