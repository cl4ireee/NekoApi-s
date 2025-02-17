const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk meng-upscale gambar dari URL
    app.get('/tools/upscale', async (req, res) => {
        const { url } = req.query; // Mengambil URL gambar dari query string

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
        }

        try {
            console.log(`Calling Suraweb API with URL: ${url}`);
            // Memanggil API Suraweb untuk meng-upscale gambar
            const response = await axios.get(`https://api.suraweb.online/tools/upscale?url=${encodeURIComponent(url)}`, {
                responseType: 'arraybuffer' // Mengambil respons sebagai buffer
            });

            // Cek status kode respons
            if (response.status !== 200) {
                return res.status(response.status).json({ status: false, error: 'Failed to upscale image', details: 'Received non-200 response' });
            }

            // Mengatur header untuk mengembalikan gambar
            res.set('Content-Type', 'image/jpg');
            res.send(response.data); // Mengirimkan data gambar ke klien
        } catch (error) {
            console.error('Error in upscale process:', error.response ? error.response.data.toString() : error.message);
            res.status(500).json({ status: false, error: 'Failed to upscale image', details: error.response ? error.response.data.toString() : error.message });
        }
    });
};
