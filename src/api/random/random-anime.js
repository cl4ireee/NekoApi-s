const axios = require('axios');

module.exports = function(app) {
    app.get('/random/anime', async (req, res) => {
        try {
            const response = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/anime', { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            res.writeHead(200, {
                'Content-Type': 'image/png', // Atau 'image/jpeg' tergantung pada format gambar
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
        } catch (error) {
            console.error("Error fetching anime image:", error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};