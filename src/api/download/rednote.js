const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk mengambil data dari URL
    app.get('/download/rednote', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query string

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
        }

        try {
            // Memanggil API untuk mendapatkan data
            const response = await axios.get(`https://api.siputzx.my.id/api/d/rednote?url=${encodeURIComponent(url)}`, {
                headers: {
                    'accept': 'application/json' // Mengatur header untuk menerima JSON
                }
            });

            // Mengembalikan hasil dari API
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Error fetching data from rednote:', error.response ? error.response.data : error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch data', details: error.response ? error.response.data : error.message });
        }
    });
};
