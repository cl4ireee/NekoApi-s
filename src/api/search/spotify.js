const axios = require('axios');

module.exports = function(app) {
    async function fetchSpotifyData(query) {
        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/spotify?q=${encodeURIComponent(query)}`);
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching data from Spotify API:", error);
            throw error;
        }
    }

    app.get('/api/spotify', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil query dari parameter URL
            if (!q) {
                return res.status(400).json({ status: false, error: 'Parameter query "q" diperlukan' });
            }
            const apiResponse = await fetchSpotifyData(q); // Mengambil data dari API
            if (apiResponse.status) {
                // Mengembalikan data dalam format yang diinginkan
                res.status(200).json({
                    status: true,
                    creator: apiResponse.creator,
                    result: apiResponse.result.map(item => ({
                        trackName: item.trackName,
                        artistName: item.artistName,
                        externalUrl: item.externalUrl
                    }))
                });
            } else {
                res.status(500).json({ status: false, error: 'Gagal mengambil data' });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
