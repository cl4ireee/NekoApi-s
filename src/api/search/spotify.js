const axios = require('axios');

module.exports = function(app) {
    async function fetchSpotifyData(query) {
        try {
            // Menggunakan API Spotify dengan metode GET
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/spotify?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Spotify API:", error.message);
            throw error;
        }
    }

    app.get('/search/spotify', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Parameter query diperlukan' });
            }
            const apiResponse = await fetchSpotifyData(q);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Memeriksa apakah ada hasil
            if (!result || result.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada lagu yang ditemukan.' });
            }

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                result: result.map(item => ({
                    trackName: item.trackName,
                    artistName: item.artistName,
                    externalUrl: item.externalUrl
                }))
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
