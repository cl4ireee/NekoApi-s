const axios = require("axios");
const cheerio = require("cheerio");

async function BSearch(query) {
    try {
        let { data: m } = await axios.get(`https://www.bilibili.tv/id/search-result?q=${encodeURIComponent(query)}`);
        let $ = cheerio.load(m);

        const results = [];
        $('li.section__list__item').each((index, element) => {
            const title = $(element).find('.highlights__text--active').text().trim();
            const videoLink = $(element).find('.bstar-video-card__cover-link').attr('href');
            const thumbnail = $(element).find('.bstar-video-card__cover-img source').attr('srcset');
            const views = $(element).find('.bstar-video-card__desc--normal').text().trim();
            const creatorName = $(element).find('.bstar-video-card__nickname').text().trim();
            const creatorLink = $(element).find('.bstar-video-card__nickname').attr('href');
            const duration = $(element).find('.bstar-video-card__cover-mask-text').text().trim();

            results.push({
                title,
                videoLink: `https://www.bilibili.tv${videoLink}`,
                thumbnail,
                views,
                creatorName,
                creatorLink: `https://www.bilibili.tv${creatorLink}`,
                duration
            });
        });

        return results;
    } catch (error) {
        console.error("Error while fetching search results:", error);
        return []; // Mengembalikan array kosong jika terjadi kesalahan
    }
}

module.exports = function (app) {
    // Endpoint untuk pencarian Bilibili
    app.get("/search/bilibili-search", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            const results = await BSearch(q); // Menggunakan 'q' sebagai parameter
            res.status(200).json({ status: true, data: results });
        } catch (error) {
            console.error("Error fetching Bilibili search results:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Bilibili search results" });
        }
    });
};
