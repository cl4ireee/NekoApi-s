const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(query) {
        try {
            // Menggunakan API baru dengan metode GET
            const response = await axios.get(`https://api.rynn-archive.biz.id/search/apkcombo?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Rynn Archive:", error.message);
            throw error;
        }
    }

    app.get('/search/apkcombo', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Query is required' });
            }
            const apiResponse = await fetchContent(q);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                results: result.map(item => ({
                    name: item.name,
                    developer: item.developer,
                    rating: item.rating,
                    imageUrl: item.imageUrl,
                    link: item.link
                }))
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
