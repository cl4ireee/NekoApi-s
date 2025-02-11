const axios = require('axios');

module.exports = function(app) {
    async function fetchFonts(query) {
        try {
            // Menggunakan API baru dengan metode GET
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/font?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from NekoApi:", error.message); // Pesan kesalahan
            throw error;
        }
    }

    app.get('/search/font', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Query parameter is required' });
            }
            const apiResponse = await fetchFonts(q);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                results: result.map(item => ({
                    title: item.title,
                    addedBy: item.addedBy,
                    downloadLink: item.downloadLink,
                    imageUrl: item.imageUrl
                }))
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
