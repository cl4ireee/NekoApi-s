const axios = require('axios');

module.exports = function(app) {
    async function fetchCosplayData() {
        try {
            // Menggunakan API Cosplay dengan metode GET
            const response = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/cosplay', {
                responseType: 'arraybuffer' // Mengambil respons sebagai array buffer
            });
            return response.data; // Mengembalikan data gambar
        } catch (error) {
            console.error("Error fetching content from Cosplay API:", error.response ? error.response.data : error.message);
            throw error;
        }
    }

    app.get('/random/cosplay', async (req, res) => {
        try {
            const imageData = await fetchCosplayData(); // Mengambil data dari API

            // Mengatur header untuk mengembalikan gambar
            res.set('Content-Type', 'image/png');
            res.set('Content-Length', imageData.length);
            res.send(imageData); // Mengirimkan data gambar sebagai respons
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
