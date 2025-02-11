const axios = require('axios');

module.exports = function(app) {
    async function fetchPixivContent(query) {
        try {
            // Menggunakan API Pixiv dengan metode GET
            const response = await axios.get(`https://api.ryzendesu.vip/api/search/pixiv?query=${encodeURIComponent(query)}`, {
                headers: {
                    'accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Pixiv API:", error.message);
            throw error;
        }
    }

    app.get('/search/pixiv', async (req, res) => {
        try {
            const { query } = req.query; // Mengambil parameter query 'query'
            if (!query) {
                return res.status(400).json({ status: false, error: 'Query parameter is required' });
            }
            const apiResponse = await fetchPixivContent(query);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Memeriksa apakah ada hasil
            if (!result || result.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada gambar yang ditemukan.' });
            }

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                results: result.map(item => ({
                    artist: item.artist,
                    caption: item.caption,
                    tags: item.tags,
                    media: item.Media
                }))
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
