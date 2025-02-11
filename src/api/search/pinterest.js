const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(query) {
        try {
            // Menggunakan API Pinterest dengan metode GET
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/pinterest?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Pinterest API:", error);
            throw error;
        }
    }

    app.get('/search/pinterest', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Query parameter is required' });
            }
            const apiResponse = await fetchContent(q);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Memeriksa apakah ada hasil
            if (!result || !result.images || result.images.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada gambar yang ditemukan.' });
            }

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                images: result.images.map(image => ({
                    imageUrl: image // Menggunakan URL gambar langsung
                }))
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};