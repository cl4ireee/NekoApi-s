const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    app.get('/komik/komikusearch', async (req, res) => {
        const { q } = req.query; // Mengambil parameter query 'q'

        // Memastikan query disediakan
        if (!q) {
            return res.status(400).json({ status: false, error: 'Parameter query diperlukan' });
        }

        try {
            // Mengambil data dari API pencarian komik
            const response = await axios.get(`https://api.komiku.id/?post_type=manga&s=${encodeURIComponent(q)}`);
            const $ = cheerio.load(response.data);
            let results = [];

            // Mengambil data komik dari hasil pencarian
            $(".bge").each((index, element) => {
                let title = $(element).find(".kan a h3").text().trim();
                let url = "https://komiku.id" + $(element).find(".kan a").attr("href");
                let thumbnail = $(element).find(".bgei img").attr("src").split("?")[0].trim();
                let synopsis = $(element).find(".kan p").text().trim().split(".")[1].trim();

                results.push({
                    title,
                    thumbnail,
                    synopsis,
                    url
                });
            });

            // Mengembalikan hasil pencarian
            res.status(200).json({
                status: true,
                results
            });
        } catch (error) {
            console.error("Kesalahan saat memproses permintaan:", error.message);
            res.status(500).json({ status: false, error: 'Terjadi kesalahan saat memproses permintaan.' });
        }
    });
};
