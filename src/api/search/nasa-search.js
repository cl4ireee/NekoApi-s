const axios = require("axios");
const cheerio = require("cheerio");

async function nasaGov(q) {
    try {
        const { data } = await axios.get(`https://www.nasa.gov/search?query=${encodeURIComponent(q)}`, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);
        const results = [];

        $(".search-result").each((_, el) => {
            const title = $(el).find(".search-title").text().trim();
            const url = $(el).find("a").attr("href");
            const excerpt = $(el).find(".search-excerpt").text().trim();
            const image = $(el).find(".search-image img").attr("src");

            if (title && url) { // Pastikan title & url tidak kosong
                results.push({
                    title,
                    url: url.startsWith("http") ? url : `https://www.nasa.gov${url}`,
                    excerpt,
                    image: image ? `https://www.nasa.gov${image}` : null,
                });
            }
        });

        return results.length ? results : [{ message: "No results found" }]; // Biar ga kosong
    } catch (error) {
        console.error("Error fetching NASA search:", error);
        return [{ message: "Error fetching data" }];
    }
}

module.exports = function setupNasaGovAPI(app) {
    app.get("/search/nasa-search", async (req, res) => {
        const q = req.query.q;
        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        const results = await nasaGov(q);
        res.json({ status: true, creator: "Claire", results });
    });
};
