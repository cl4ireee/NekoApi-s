const axios = require('axios');

module.exports = function(app) {
    app.get('/random/anime', async (req, res) => {
        try {
            const response = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/anime');
            const { status, result } = response.data;

            if (status) {
                // Mengambil gambar acak dari hasil
                const randomImage = result[Math.floor(Math.random() * result.length)];
                const imageUrl = randomImage; // Pastikan ini adalah URL gambar

                // Mengambil gambar dari URL
                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

                // Mengatur header dan mengirimkan gambar
                res.writeHead(200, {
                    'Content-Type': 'image/png', // Atau 'image/jpeg' tergantung pada format gambar
                    'Content-Length': imageResponse.data.length,
                });
                res.end(imageResponse.data);
            } else {
                res.status(400).json({ status: false, error: 'Failed to fetch anime images' });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};
