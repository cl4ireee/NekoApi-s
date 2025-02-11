
const axios = require('axios');

module.exports = function(app) {
    app.get('/download/tiktok', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query parameter
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/download/tiktok?url=${encodeURIComponent(url)}`);
            const { status, result } = response.data;

            if (status) {
                const tiktokData = {
                    status: true,
                    title: result.title,
                    cover: result.cover,
                    origin_cover: result.origin_cover,
                    no_wm: result.no_wm, // Link video tanpa watermark
                    wm: result.wm, // Link video dengan watermark
                    music: result.music // Link musik
                };
                res.status(200).json(tiktokData);
            } else {
                res.status(400).json({ status: false, error: 'Failed to fetch video' });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
