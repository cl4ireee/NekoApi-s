const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mencari manga
async function avz(query) {
    try {
        const url = `https://westmanga.fun/?s=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const results = [];

        $('.bs .bsx').each((i, el) => {
            const title = $(el).find('.tt').text().trim();
            const chapter = $(el).find('.epxs').text().trim();
            const mangaUrl = $(el).find('a').attr('href');
            let imgUrl = $(el).find('img').attr('src');

            imgUrl = imgUrl.replace(/-\d+x\d+\.(jpg|jpeg|png)$/, '.jpg');

            results.push({
                title,
                chapter,
                mangaUrl,
                imgUrl
            });
        });

        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupWestMangaRoutes(app) {
    app.get('/anime/westmanga', async (req, res) => {
        const { q } = req.query; // Mengambil query dari parameter
        if (!q) {
            return res.status(400).json({ status: false, message: 'Judul tidak boleh kosong.' });
        }

        const results = await avz(q);
        if (results.length === 0) {
            return res.json({ status: false, message: 'Tidak ditemukan hasil.' });
        } else {
            return res.json({ status: true, results });
        }
    });
};
