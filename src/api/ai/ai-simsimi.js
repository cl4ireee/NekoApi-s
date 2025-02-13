const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    async function scrapeSimSimi(text) {
        try {
            // Mengambil halaman dari SimSimi
            const response = await axios.get(`https://www.simsimi.com/talk?text=${encodeURIComponent(text)}`);
            const html = response.data;

            // Menggunakan cheerio untuk mem-parsing HTML
            const $ = cheerio.load(html);
            const result = $('.chatbox .bot').text(); // Sesuaikan selector ini dengan struktur HTML yang tepat

            return result;
        } catch (error) {
            console.error("Error scraping SimSimi:", error.message);
            throw error;
        }
    }

    app.get('/ai/simsimi', async (req, res) => {
        try {
            const { text } = req.query; // Mengambil parameter query 'text'
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await scrapeSimSimi(text);

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status: true,
                result // Mengembalikan hasil dari scraping
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
