const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk meng-retouch gambar dari URL
    app.get('/tools/imgretouch', async (req, res) => {
        const { url } = req.query; // Mengambil URL gambar dari query string

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
        }

        try {
            // Memanggil API Fast Rest untuk meng-retouch gambar
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/aiimage/imgretouch?url=${encodeURIComponent(url)}`, {
                responseType: 'arraybuffer', // Mengambil respons sebagai buffer
                headers: {
                    'accept': 'image/jpeg' // Mengatur header untuk menerima gambar
                }
            });

            // Mengatur header untuk mengembalikan gambar
            res.set('Content-Type', 'image/jpeg');
            res.send(response.data); // Mengirimkan data gambar ke klien
        } catch (error) {
            console.error('Error in image retouch process:', error.response ? error.response.data : error.message);
            res.status(500).json({ status: false, error: 'Failed to retouch image', details: error.response ? error.response.data : error.message });
        }
    });
};
