const axios = require('axios');
const cheerio = require('cheerio');

class Komiku {
    search = async function(q) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(`https://api.komiku.id/?post_type=manga&s=${q}`);
                const $ = cheerio.load(response.data);
                let array = [];
                $(".bge").each((index, element) => {
                    let title = $(element).find(".kan a h3").text().trim();
                    let url = "https://komiku.id" + $(element).find(".kan a").attr("href");
                    let thumbnail = $(element).find(".bgei img").attr("src").split("?")[0].trim();
                    let synopsis = $(element).find(".kan p").text().trim().split(".")[1].trim();
                    array.push({
                        title,
                        thumbnail,
                        synopsis,
                        url
                    });
                });
                resolve(array);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Middleware untuk menangani permintaan API
module.exports = function(app) {
    const komiku = new Komiku();

    // Endpoint untuk mencari komik
    app.get('/search/komikusearch', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Parameter query diperlukan' });
            }

            const results = await komiku.search(q);
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
