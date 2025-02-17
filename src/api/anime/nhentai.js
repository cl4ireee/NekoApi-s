const axios = require("axios");
const cheerio = require("cheerio");

// Fungsi untuk mengambil data dari nhentai
const nhentaiSearch = async (query) => {
    try {
        const { data } = await axios.get(`https://nhentai.net/search/?q=${encodeURIComponent(query)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "Cache-Control": "no-cache",
            },
        });

        const $ = cheerio.load(data);
        const items = [];

        $(".gallery").each((_, element) => {
            const title = $(element).find(".caption").first().text();
            const imageUrl = $(element).find("img").attr("data-src");
            const link = "https://nhentai.net" + $(element).find("a").attr("href");

            if (title && imageUrl && link) {
                items.push({ title, imageUrl, link });
            }
        });

        return { status: true, results: items };
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return { status: false, error: error.message };
    }
};

// Endpoint API untuk pencarian nhentai
module.exports = (app) => {
    app.get("/anime/nhentai", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter q is required" });
        }

        const result = await nhentaiSearch(q);

        if (!result.status) {
            return res.status(500).json({ status: false, error: result.error });
        }

        res.json(result);
    });
};
