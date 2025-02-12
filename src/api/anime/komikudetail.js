// detail.js

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/komik/komikudetail', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            let result = { metadata: {}, chapters: [] };

            // Mengambil metadata komik
            $("#Informasi").each((index, element) => {
                $(element).find(".inftable tr").each((i, row) => {
                    const name = $(row).find("td").eq(0).text().trim();
                    const value = $(row).find("td").eq(1).text().trim();
                    result.metadata[name] = value;
                });
                result.metadata.thumbnail = $(element).find("img").attr("src").split("?")[0].trim();
            });
            result.metadata.sinopsis = $("#Judul .desc").text().trim();

            // Mengambil daftar chapter
            $("#Daftar_Chapter tbody tr").each((index, element) => {
                const chapterTitle = $(element).find(".judulseries a span").text().trim();
                const chapterUrl = "https://komiku.id" + $(element).find(".judulseries a").attr("href");
                const released = $(element).find(".tanggalseries").text().trim();
                if (chapterTitle) {
                    result.chapters.push({ title: chapterTitle, url: chapterUrl, released });
                }
            });

            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            console.error('Error fetching comic details:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch comic details' });
        }
    });
}
