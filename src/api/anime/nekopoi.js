const axios = require('axios');

module.exports = function(app) {
    async function fetchNekopoiData() {
        try {
            // Menggunakan API Nekopoi dengan metode GET
            const response = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/nekopoi');
            return response.data; // Mengembalikan data dari API
        } catch (error) {
            console.error("Error fetching content from Nekopoi API:", error.message);
            throw error;
        }
    }

    // Endpoint untuk mengambil data dari Nekopoi
    app.get('/anime/nekopoi', async (req, res) => {
        try {
            const nekopoiData = await fetchNekopoiData(); // Mengambil data dari API

            // Mengembalikan hasil dalam format JSON
            res.status(200).json({
                status: true,
                result: nekopoiData.result // Mengambil hasil dari data yang diterima
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
