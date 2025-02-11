const axios = require('axios');

module.exports = function(app) {
    app.get('/random/cosplay', async (req, res) => {
        try {
            // Mengambil data dari API cosplay
            const response = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/cosplay');
            const data = response.data;

            // Memeriksa apakah data yang diterima valid
            if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada gambar yang ditemukan.' });
            }

            // Mengambil gambar acak dari hasil
            const randomImage = data.result[Math.floor(Math.random() * data.result.length)].image;

            // Mengambil gambar dari URL dan mengembalikannya sebagai respons
            const imageResponse = await axios.get(randomImage, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');

            res.writeHead(200, {
                'Content-Type': 'image/png', // Atau 'image/jpeg' tergantung pada format gambar
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
        } catch (error) {
            console.error("Error fetching cosplay image:", error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};