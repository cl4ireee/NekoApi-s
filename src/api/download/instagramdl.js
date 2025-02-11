const axios = require('axios');

module.exports = function(app) {
    app.get('/download/instagram', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query parameter
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/download/instagram?url=${encodeURIComponent(url)}`);
            const { status, result } = response.data;

            if (status) {
                res.status(200).json({
                    status: true,
                    result: {
                        url: result.url, // URL media (gambar atau video)
                        caption: result.caption, // Keterangan
                        username: result.username, // Nama pengguna
                        like: result.like, // Jumlah suka
                        comment: result.comment, // Jumlah komentar
                        isVideo: result.isVideo // Apakah ini video
                    }
                });
            } else {
                res.status(400).json({ status: false, error: 'Failed to fetch content from Instagram' });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};
