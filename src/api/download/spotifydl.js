const axios = require('axios');

module.exports = function(app) {
    app.get('/download/spotify', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query parameter
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/download/spotify?url=${encodeURIComponent(url)}`);
            const { status, result } = response.data;

            if (status) {
                const spotifyData = {
                    status: true,
                    title: result.data.title,
                    type: result.data.type,
                    artist: result.data.artis,
                    duration: result.data.durasi,
                    image: result.data.image,
                    download: result.data.download // Link untuk mengunduh lagu
                };
                res.status(200).json(spotifyData);
            } else {
                res.status(400).json({ status: false, error: 'Failed to fetch track' });
            }
        } catch (error) {
            console.error("Error fetching Spotify data:", error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};
