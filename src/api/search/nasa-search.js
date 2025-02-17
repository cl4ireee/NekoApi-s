const axios = require("axios");
const cheerio = require("cheerio");

async function nasaGov(q) {
    try {
        let { data } = await axios.get(`https://www.nasa.gov/search?query=${encodeURIComponent(q)}`);
        const $ = cheerio.load(data);
        const results = [];

        $("a.hds-search-result").each((_, el) => {
            const title = $(el).find(".hds-search-result-heading").text().trim();
            const url = $(el).attr("href");
            const excerpt = $(el).find(".hds-search-result-excerpt").text().trim();
            const image = $(el).find(".hds-search-result-thumbnail img").attr("src");

            results.push({
                title,
                url: url.startsWith("http") ? url : `https://www.nasa.gov${url}`,
                excerpt,
                image: image ? `https://www.nasa.gov${image}` : null,
            });
        });

        return results;
    } catch (error) {
        console.error("Error fetching NASA search results:", error.message);
        return [];
    }
}

// Export langsung dalam module
module.exports = function setupNasaGovAPI(app) {
    app.get("/search/nasa-search", async (req, res) => {
        const { q } = req.query; // Menggunakan parameter `q` dalam request

        if (!q) {
            return res.status(400).json({ 
                status: false, 
                error: "Query parameter 'q' is required" 
            });
        }

        try {
            const results = await nasaGov(q);
            res.status(200).json({ 
                status: true, 
                results 
            });
        } catch (error) {
            console.error("Error processing NASA search API:", error.message);
            res.status(500).json({ 
                status: false, 
                error: "Internal Server Error" 
            });
        }
    });
};
